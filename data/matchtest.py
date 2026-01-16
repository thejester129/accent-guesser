import json

geodata = json.load(open('./countries.geo.json'))
speakerdata = json.load(open('./speakers.json'))

speaker_countries = set()
for speaker in speakerdata:
    speaker_countries.add(speaker['country'])

map_countries = set()
for feature in geodata['features']:
    map_countries.add(feature['properties']['name'].lower())


# diff sets
diff = print(speaker_countries.difference(map_countries))
print(diff)