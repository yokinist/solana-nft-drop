import { useState, useEffect, Fragment } from 'react';

type Props = { dropDate: Date };

type DateKey = 'days' | 'hours' | 'minutes' | 'seconds';
type DateObj = { [K in DateKey]: number | undefined };

export const CountDown: React.VFC<Props> = ({ dropDate }) => {
  const [countDateObj, setCountDateObj] = useState<DateObj>({
    days: undefined,
    hours: undefined,
    minutes: undefined,
    seconds: undefined,
  });

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

      if (distance < 0) {
        clearInterval(interval);
      }
    }, 1000);

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
            {Object.keys(countDateObj).map((dateKey) => {
              return (
                <Fragment key={dateKey}>
                  <div className="flex flex-col justify-center text-center">
                    <span className="text-sm tracking-tight bold text-gray-900 sm:text-2xl md:text-3xl font-mono">
                      {countDateObj[dateKey as DateKey] ?? 'X'}
                    </span>
                    <span className="text-xs text-gray-500">{dateKey}</span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
