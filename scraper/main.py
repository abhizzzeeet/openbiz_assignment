from form_parser import scrape_aadhaar_and_pan
from utils.db import save_to_postgres
from utils.utils import save_to_json

if __name__ == "__main__":
    schema = scrape_aadhaar_and_pan()
    save_to_json(schema, "output/form_schema.json")
    
    db_config = {
        "dbname": "openbiz_assignment",
        "user": "postgres",
        "password": "postgres",
        "host": "localhost",  
    }

    save_to_postgres(schema, db_config)

    print("Scraping complete. Output saved to output/form_schema.json")
    print(" Done! Schema saved to JSON and PostgreSQL.")

