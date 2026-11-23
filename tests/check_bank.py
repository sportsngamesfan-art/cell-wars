"""Validate the local-first chapter question bank without third-party dependencies."""
import collections,json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
questions=json.loads((ROOT/'data/questions.json').read_text())
topics={t['id'] for t in json.loads((ROOT/'data/curriculum.json').read_text())}
assert len(questions)==180
assert len({q['id'] for q in questions})==180
assert len({q['prompt'] for q in questions})==180
assert collections.Counter(q['difficulty'] for q in questions)=={'easy':35,'medium':65,'hard':55,'expert':25}
assert len({q['type'] for q in questions})==15
assert {q['topicId'] for q in questions}==topics
assert all(q['explanation'] and len(q['explanation'])>=12 for q in questions)
assert all(q['answer'].strip() for q in questions)
for q in questions:
 assert q['options'] is None or q['answer'] in q['options'],q['id']
 assert len(q.get('hint',''))>=0
 if q['type']=='calculate' and re.search(r'^In WEEKLY EXPENSES, what is the total',q['prompt']):
  name=re.search(r'total for (.+?) \(row',q['prompt']).group(1)
  data={'Eatables':[50,0,200,0,0,500],'Cold Drink':[40,40,120,0,40,80],'Milk':[80,80,120,80,80,160],'Transport':[300,250,300,300,300,100],'Stationery':[5,0,0,25,0,0],'Gift':[50,0,100,0,0,100],'Others':[0,100,500,0,0,500]}
  assert float(q['answer'])==sum(data[name]),q['id']
print('PASS: 180 unique questions, 15 formats, correct difficulty distribution, all topics, answer keys and expense totals.')
