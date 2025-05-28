import os
import json

def extract_translation(start, end, translation):
    """
    Extracts translations from the given translation string.
    """
    beg = translation.find(start)
    end = translation.find(end)
    if start != -1:
        return translation[beg + len(start):end].strip()
    return ''

questions = []

# Find all *.csv files in the current directory
for filename in os.listdir('.'):
    if filename.endswith('.csv'):
        with open(filename, 'r') as file:
            # Skip the header line
            next(file)
            # Parse "Question Number|Question|Choices|Correct Answer|Translation"
            # into json:
            # {
            #    "question": string,
            #    "translation": string,
            #    "answers": [
            #      {
            #        "answer": string,
            #        "correct": boolean,
            #        "translation": string
            #      }
            #    ]
            # }
            for line in file:
                line = line.encode('utf-8').decode('utf-8-sig').strip()
                line = line.replace('"', '')
                data = line.split('|')

                tr = data[4].strip()
                translations = []
                translations.append(tr.split(' Α) ')[0].strip())
                translations.append(extract_translation('Α) ', ', Β) ', tr))
                translations.append(extract_translation('Β) ', ', Γ) ', tr))
                if ' Δ) ' in tr:
                    translations.append(extract_translation('Γ) ', ', Δ) ', tr))
                    translations.append(tr.split(' Δ) ')[1].strip())
                elif ' Γ) ' in tr:
                    translations.append(tr.split(' Γ) ')[1].strip())

                answer = data[2].strip()#.split(',')[i].strip().replace('Α) ', '').replace('Β) ', '').replace('Γ) ', '').replace('Δ) ', '')
                answers = []
                answers.append(extract_translation('Α) ', ', Β) ', answer))
                if 'Γ) ' in answer:
                    answers.append(extract_translation('Β) ', ', Γ) ', answer))
                elif 'Β)' in answer:
                    answers.append(answer.split('Β)')[1].strip())

                if ' Δ) ' in answer:
                    answers.append(extract_translation('Γ) ', ', Δ) ', answer))
                    answers.append(answer.split(' Δ) ')[1].strip())
                elif ' Γ) ' in answer:
                    answers.append(answer.split(' Γ) ')[1].strip())

                question = {
                    "question": data[1].strip(),
                    "translation": translations[0],
                    "answers": [
                        {
                            "answer": answers[i].strip(),
                            "correct": data[3].strip() == str(i),
                            "translation": translations[i + 1] if i < len(translations) - 1 else ''
                        }
                        for i in range(len(answers))
                    ]
                }

                # Translate and sort σωστό/λάθος
                if len(question['answers']) == 2:
                    true_false_answers = [{}, {}]
                    for answer in question['answers']:
                        answer_str = answer['answer'].strip().lower()
                        if answer_str == 'σωστό':
                            answer['answer'] = 'σωστό'
                            answer['translation'] = 'верно'
                            true_false_answers[0] = answer
                        elif answer_str == 'λάθος':
                            answer['answer'] = 'λάθος'
                            answer['translation'] = 'неверно'
                            true_false_answers[1] = answer
                        question['answers'] = true_false_answers

                # Check answers size
                if len(question['answers']) > 4:
                    raise Exception(f"Too many answers for question: {question['question']}")

                questions.append(question)
                

# Save the data to a JSON file
with open('./data.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
