import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';
import React, { useEffect, CSSProperties } from 'react';

type PlaceValue = number | '.';

interface NumberProps {
  mv: MotionValue<number>;
  number: number;
  height: number;
}

function Number({ mv, number, height }: NumberProps) {
  const y = useTransform(mv, (latest: number) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  const baseStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return <motion.span style={{ ...baseStyle, y }}>{number}</motion.span>;
}

function normalizeNearInteger(num: number): number {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function getValueRoundedToPlace(value: number, place: number): number {
  const scaled = value / place;
  return Math.floor(normalizeNearInteger(scaled));
}

interface DigitProps {
  place: PlaceValue;
  value: number;
  height: number;
  digitStyle?: CSSProperties;
}

function Digit({ place, value, height, digitStyle }: DigitProps) {
  if (place === '.') {
    return (
      <span
        className="relative inline-flex items-center justify-center"
        style={{ height, width: 'fit-content', ...digitStyle }}
      >
        .
      </span>
    );
  }

  // At this point, place must be a number
  const placeNum = place as number;
  const valueRoundedToPlace = getValueRoundedToPlace(value, placeNum);
  const animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: 70,
    damping: 15,
    mass: 1
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle: CSSProperties = {
    height,
    position: 'relative',
    width: '1ch',
    fontVariantNumeric: 'tabular-nums'
  };

  return (
    <span className="relative inline-flex overflow-hidden" style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

interface CountUpProps {
  value: number;
  fontSize?: number;
  padding?: number;
  places?: PlaceValue[];
  gap?: number;
  textColor?: string;
  className?: string;
}

export default function CountUp({
  value,
  fontSize = 48,
  padding = 0,
  places,
  gap = 2,
  textColor = 'inherit',
  className = ''
}: CountUpProps) {
  const height = fontSize + padding;

  const internalPlaces: PlaceValue[] = places || [...value.toString()].map((ch, i, a) => {
    if (ch === '.') return '.';
    const dotIndex = a.indexOf('.');
    const isInteger = dotIndex === -1;
    const exponent = isInteger ? a.length - i - 1 : i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);
    return 10 ** exponent;
  });

  return (
    <span className={`inline-flex items-center ${className}`} style={{ color: textColor, fontSize, fontWeight: 'bold' }}>
      <span className="flex" style={{ gap }}>
        {internalPlaces.map((place, idx) => (
          <Digit key={idx} place={place} value={value} height={height} />
        ))}
      </span>
    </span>
  );
}
