# convert csv file to json
import pandas as pd 

def convert_csv_to_json(csv_file, json_file):
    df = pd.read_csv(csv_file)
    df.to_json(json_file, orient='records', lines=True)

if __name__ == "__main__":
    convert_csv_to_json('speakers_all.csv', 'speakers.json')