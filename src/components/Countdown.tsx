import { useState, useEffect } from 'react';

type Props = {
  dropDate: Date;
};

type DateObj = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const CountDown: React.VFC<Props> = ({ dropDate }) => {
  const [countDateObj, setCountDateObj] = useState<DateObj>();

  useEffect(() => {
    if (!dropDate) return;

    const interval = setInterval(() => {
      const currentDate = new Date().getTime();
      const distance = dropDate.getTime() - currentDate;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountDateObj({
        days,
        hours,
        minutes,
        seconds,
      });

      // distanceが0になったらドロップタイムが来たことを示します
      if (distance < 0) {
        clearInterval(interval);
      }
    }, 1000);

    // コンポーネントが取り外されたときには、intervalを初期化しましょう。
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dropDate]);

  return (
    <div className="flex text-center">
      <div className="border-2 rounded-lg px-3 py-3 border-gray-200 ">
        <span className="base text-gray-500 text-center mb-2 text-sm">Drop starting in ...</span>
        <div className="flex flex-col">
          <div className="flex w-60 justify-evenly">
            <div className="flex flex-col justify-center text-center">
              <span className="text-sm tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono">
                {countDateObj?.days ?? 'X'}
              </span>
              <span className="text-xs text-gray-500">Days</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <span className="text-sm tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono">
                {countDateObj?.hours ?? 'X'}
              </span>
              <span className="text-xs text-gray-500">Hours</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <span className="text-sm tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono">
                {countDateObj?.minutes ?? 'X'}
              </span>
              <span className="text-xs text-gray-500">Minutes</span>
            </div>
            <div className="flex flex-col justify-center text-center">
              <span className="text-sm tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono">
                {countDateObj?.seconds ?? 'X'}
              </span>
              <span className="text-xs text-gray-500">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
