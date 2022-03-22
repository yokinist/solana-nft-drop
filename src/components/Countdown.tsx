import { useState } from 'react';

type Props = {};
//
export const CountDown: React.VFC<Props> = ({}) => {
  // State
  const [timerString, setTimerString] = useState('');

  return (
    <div className="timer-container">
      <p className="timer-header">Candy Drop Starting In</p>
      {timerString && <p className="timer-value">{`⏰ ${timerString}`}</p>}
    </div>
  );
};
