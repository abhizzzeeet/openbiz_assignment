import psycopg2
import json

def save_to_postgres(schema_list, db_config):
    conn = psycopg2.connect(
        dbname=db_config["dbname"],
        user=db_config["user"],
        password=db_config["password"],
        host=db_config["host"],
        port=db_config.get("port", 5432)
    )
    cursor = conn.cursor()

    # Ensure table exists (only with 'id' and 'schema' columns)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS form_schema (
            id SERIAL PRIMARY KEY,
            schema JSONB
        );
    """)

    # Optional: clean old data if needed (you can remove this if you don't want to delete old records)
    cursor.execute("DELETE FROM form_schema")

    # Insert entire schema as JSON (not just 'fields')
    schema_json = json.dumps(schema_list)  # Directly storing the whole schema as JSON
    cursor.execute(
        "INSERT INTO form_schema (schema) VALUES (%s)",
        (schema_json,)
    )

    conn.commit()
    cursor.close()
    conn.close()
    print("Schema saved to PostgreSQL.")
