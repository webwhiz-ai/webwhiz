### Running celery worker

```bash
celery -A cosine_similarity_worker worker -l info --concurrency 1
```