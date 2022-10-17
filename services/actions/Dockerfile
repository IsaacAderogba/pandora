FROM python:3.9-slim as builder

RUN pip install --upgrade pip
RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.in-project true
RUN poetry install --no-dev

COPY . .

FROM python:3.9-slim

COPY --from=builder /src /src
COPY --from=builder /.venv /.venv
COPY --from=builder /pyproject.toml /pyproject.toml

RUN pip install poetry

CMD ["poetry", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--proxy-headers"]