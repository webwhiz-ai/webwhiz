import fitz
from pymongo.database import Database
from typing import Optional, TypedDict
from bson.objectid import ObjectId
from datetime import datetime
from enum import Enum
from inscriptis import get_text


class DataStoreType(Enum):
    WEBPAGE = "WEBPAGE"
    CUSTOM = "CUSTOM"
    DOCUMENT = "DOCUMENT"
    PDF = "PDF"


class DataStoreStatus(Enum):
    CREATED = "CREATED"
    TRAINED = "TRAINED"


class KbDataStore(TypedDict):
    _id: Optional[ObjectId]
    knowledgebaseId: ObjectId
    url: Optional[str]
    title: str
    content: str
    type: DataStoreType
    createdAt: datetime
    updatedAt: datetime


def get_text_from_pdf(
    knowledgebase_id: str, pdf_file_path: str, max_pages: int, filename: str, db: Database
) -> str:
    pdf_text = ""

    with fitz.open(pdf_file_path) as doc:
        page_count = 0
        for page in doc:
            page_count += 1
            # text = page.get_text("blocks")
            text = page.get_text()
            pdf_text += text

            if page_count >= max_pages:
                break

    # Insert item to data store
    data_store_collection = db["kbDataStore"]
    ts = datetime.now()
    ds_item: KbDataStore = {
        "knowledgebaseId": ObjectId(knowledgebase_id),
        "content": pdf_text,
        "url": pdf_file_path,
        "title": filename,
        "type": DataStoreType.PDF.value,
        "status": DataStoreStatus.CREATED.value,
        "createdAt": ts,
        "updatedAt": ts,
    }
    res = data_store_collection.insert_one(ds_item)
    return str(res.inserted_id)


def get_text_from_html(html: str) -> str:
    return get_text(html)
