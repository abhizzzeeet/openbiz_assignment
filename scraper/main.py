from form_parser import scrape_aadhaar_and_pan
from utils import save_to_json

if __name__ == "__main__":
    # schema = scrape_form()
    schema = scrape_aadhaar_and_pan()
    save_to_json(schema, "output/form_schema.json")
    # schema = scrape_step_two()
    # save_to_json(schema, "output/form_schema_pan.json")
    print("Scraping complete. Output saved to output/form_schema.json")
