import os
from typing import List

import pymongo
import redis
import psycopg2
from celery import Celery
from dotenv import load_dotenv

from cosine_similarity import get_top_chunks, get_top_chunks_from_pg
from extract_text import get_text_from_pdf, get_text_from_html
from pgvector.psycopg2 import register_vector

load_dotenv()


# Redis related
REDIS_HOST = os.getenv("REDIS_HOST") or "localhost"
REDIS_PORT = int(os.getenv("REDIS_PORT") or "6379")
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL is not None:
    r = redis.from_url(REDIS_URL)
else:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

# Mongodb Related
MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
MONGO_DBNAME = os.getenv("MONGO_DBNAME")
mongo = pymongo.MongoClient(MONGO_URI)
db = mongo[MONGO_DBNAME]

# Celery worker related
REDIS_CONN_STR = f"redis://{REDIS_HOST}:{REDIS_PORT}/"
app = Celery("cosine_similiary_worker", broker=REDIS_CONN_STR, backend=REDIS_CONN_STR)
app.conf.result_expires = 60

# PostgreSQL Related
POSTGRES_HOST = os.getenv("POSTGRES_HOST") or "localhost"
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT") or "5432")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DBNAME = os.getenv("POSTGRES_DB")

pg = psycopg2.connect(
    host=POSTGRES_HOST,
    port=POSTGRES_PORT,
    user=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    dbname=POSTGRES_DBNAME
)
register_vector(pg)

@app.task
def get_top_n_chunks(
    target_embedding: List[float], knowledgebase_id: str, chunk_count: int
):
    return get_top_chunks(target_embedding, knowledgebase_id, chunk_count, db, r)

@app.task
def get_top_n_chunks_from_pg(
    target_embedding: List[float], knowledgebase_id: str, chunk_count: int
):
    return get_top_chunks_from_pg(target_embedding, knowledgebase_id, chunk_count, pg)


@app.task
def extract_pdf_text(knowledgebase_id: str, pdf_path: str, max_pages: int, filename: str) -> str:
    return get_text_from_pdf(knowledgebase_id, pdf_path, max_pages, filename, db)


@app.task
def extract_html_text(html: str) -> str:
    return get_text_from_html(html)
