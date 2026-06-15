'use client'

import { memo, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getElapsedTime } from '@/lib/achievements'

interface Props {
  quitDate: string
}

function LiveCounter({ quitDate }: Props) {
  const t = useTranslations('common')
  const [time, setTime] = useState(getElapsedTime(quitDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getElapsedTime(quitDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [quitDate])

  const units = [
    { value: time.days, label: time.days === 1 ? t('day') : t('days') },
    { value: time.hours, label: time.hours === 1 ? t('hour') : t('hours') },
    { value: time.minutes, label: time.minutes === 1 ? t('minute') : t('minutes') },
    { value: time.seconds, label: time.seconds === 1 ? t('second') : t('seconds') },
  ]

  return (
    <div
      className="grid grid-cols-4 gap-3"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${time.days} ${units[0].label}, ${time.hours} ${units[1].label}, ${time.minutes} ${units[2].label}, ${time.seconds} ${units[3].label}`}
    >
      {units.map(({ value, label }) => (
        <div
          key={label}
          aria-hidden="true"
          className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <span className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 tabular-nums leading-none">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default memo(LiveCounter)
