import json, sys
print(sys.argv[1], sys.argv[2])


repository_id = sys.argv[2]

# with open('clone.json', 'r') as fh:
#     now = json.load(fh)
with open('clone_before.json', 'r') as fh:
    before = json.load(fh)
with open('updated_clone.json', 'r') as fh:
    updated = json.load(fh)

if repository_id not in before.keys():
    before[repository_id] = {}

if 'clones' not in before[repository_id].keys():
    before[repository_id]['clones'] = []

date_list = [t['timestamp'] for t in before[repository_id]['clones']]
for i in updated['clones']:
    if i['timestamp'] not in date_list:
        before[repository_id]['clones'].append(i)
    else:
        for b_clones in before[repository_id]['clones']:
            # 以最後的為主
            if b_clones['timestamp'] == i['timestamp']:
                b_clones['count'] = i['count']
                b_clones['uniques'] = i['uniques']

before[repository_id]['count'] = sum([x['count'] for x in before[repository_id]['clones']])
before[repository_id]['uniques'] = sum([x['uniques'] for x in before[repository_id]['clones']])

before.pop('count', None)
before.pop('uniques', None)
before.pop('clones', None)

with open('clone.json', 'w', encoding='utf-8') as fh:
    json.dump(before, fh, ensure_ascii=False, indent=4)
with open('clone_before.json', 'w', encoding='utf-8') as fh:
    json.dump(before, fh, ensure_ascii=False, indent=4)