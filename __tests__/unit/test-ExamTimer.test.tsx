import { render } from '@testing-library/react';
import ExamTimer from '../../components/ExamTimer';

describe('Unit: ExamTimer', () => {
  it('renders time left', () => {
    const { getByText } = render(<ExamTimer timeLeft={90} />);
    expect(getByText('Time Left: 1:30')).toBeInTheDocument();
  });
});
