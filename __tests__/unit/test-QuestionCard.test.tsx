import { render } from '@testing-library/react';
import QuestionCard from '../../components/QuestionCard';
import { Question } from '../../lib/types';

describe('Unit: QuestionCard', () => {
  it('renders question and options', () => {
    const question: Question = {
      id: 1,
      question: 'Test Q?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    };
    const { getByText } = render(
      <QuestionCard question={question} selectedOption={undefined} onSelect={() => {}} />
    );
    expect(getByText('Test Q?')).toBeInTheDocument();
    expect(getByText('A')).toBeInTheDocument();
  });
});
