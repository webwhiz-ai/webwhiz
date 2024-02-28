import os
import traceback
from typing import List, Optional, TypedDict

import numpy as np
import pandas as pd
from bson import json_util
from bson.objectid import ObjectId
from openai.embeddings_utils import cosine_similarity
from pymongo.collection import Collection
from pymongo.database import Database
from redis import Redis
from psycopg2.extensions import connection

EMBEDDINGS_TTL = 5 * 60


class KbEmbedding(TypedDict):
    _id: Optional[ObjectId]
    knowledgebaseId: ObjectId
    embededdings: List[float]


class ChunkEmbedding(TypedDict):
    chunkId: Optional[ObjectId]
    embeddings: List[float]


class Embeddings(TypedDict):
    _id: Optional[ObjectId]
    embeddings: List[ChunkEmbedding]


def get_embeddings_for_knowledgebase(
    id: str,
    db: Database,
    r: Redis,
) -> Embeddings:
    embedding_collection = db["kbEmbeddings"]

    embeddings = r.get(f"e_{id}")
    kb_id = ObjectId(id)
    if embeddings is None:
        # Load embeddings for kb from db and store in cache
        kb_embeddings: List[KbEmbedding] = embedding_collection.find(
            {"knowledgebaseId": kb_id}
        )
        embeddings: Embeddings = {
            "_id": kb_id,
            "embeddings": [],
        }
        for embedding in kb_embeddings:
            embeddings["embeddings"].append(
                {
                    "chunkId": embedding["_id"],
                    "embeddings": embedding["embeddings"],
                }
            )

        r.set(f"e_{id}", json_util.dumps(embeddings), ex=EMBEDDINGS_TTL)
    else:
        embeddings = json_util.loads(embeddings)

    return embeddings


def get_top_chunks(
    target_embedding: List[float],
    knowledgebase_id: str,
    chunk_count: int,
    db: Database,
    r: Redis,
):
    try:
        embeddings = get_embeddings_for_knowledgebase(knowledgebase_id, db, r)

        df = pd.DataFrame(embeddings["embeddings"])
        df["embeddings"] = df.embeddings.apply(np.array)
        df["similarity"] = df.embeddings.apply(
            lambda x: cosine_similarity(x, target_embedding)
        )

        results = json_util.dumps(
            df.sort_values("similarity", ascending=False)
            .head(chunk_count)[["chunkId", "similarity"]]
            .to_dict(orient="records")
        )

        return results
    except Exception as e:
        print(e)
        traceback.print_exc()

def get_top_chunks_from_pg(
    target_embedding: List[float],
    knowledgebase_id: str,
    chunk_count: int,
    pg: connection,
):
    cursor = pg.cursor()
    target_embedding_array = np.array(target_embedding)
    try:
        cursor.execute('SELECT _id, (1 - (vector(embeddings) <=> vector(%s))) as similarity FROM kb_embeddings WHERE kb_embeddings.kbId = %s ORDER BY similarity DESC LIMIT %d', (target_embedding_array, knowledgebase_id, chunk_count))
        result = cursor.fetchall()
        formatted_result = []
        for row in result:
            formatted_result.append({
                "chunkId": { "$oid": str(row[0]) },
                "similarity": row[1]
            })
        return json_util.dumps(formatted_result)
    except Exception as e:
        print(e)
        traceback.print_exc()
    finally:
        cursor.close()