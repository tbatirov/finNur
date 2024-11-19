import React from 'react';
import RatioCard from './RatioCard';
import { Ratio } from '../../types/financial';

interface Props {
  name: string;
  ratios: Ratio[];
}

export default function RatioCategory({ name, ratios }: Props) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-700 mb-4">{name}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ratios.map((ratio) => (
          <RatioCard key={ratio.name} {...ratio} />
        ))}
      </div>
    </div>
  );
}