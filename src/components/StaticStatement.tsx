import React from 'react';
import { GeneratedStatement } from '../types/financial';

interface Props {
  statement: GeneratedStatement;
}

export default function StaticStatement({ statement }: Props) {
  ///console.log('Rendering statement:', statement);

  if (!statement || !Array.isArray(statement.lineItems)) {
    console.warn('Invalid statement data:', statement);
    return (
      <div className="p-4 text-center text-gray-500">
        No statement data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 text-left text-sm font-semibold text-gray-600">Description</th>
            <th className="p-3 text-right text-sm font-semibold text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          {statement.lineItems.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-3 text-sm text-gray-600">
                <div>
                  <p>{item.description}</p>
                  <p className="text-xs text-gray-400">{item.section}</p>
                </div>
              </td>
              <td className={`p-3 text-sm text-right ${
                item.amount < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {new Intl.NumberFormat('uz-UZ', {
                  style: 'decimal',
                  minimumFractionDigits: 2
                }).format(Math.abs(item.amount))}
              </td>
            </tr>
          ))}
        </tbody>
        {Array.isArray(statement.subtotals) && statement.subtotals.length > 0 && (
          <tfoot>
            {statement.subtotals.map((subtotal, index) => (
              <tr key={`subtotal-${index}`} className="border-t font-medium">
                <td className="p-3 text-sm text-gray-700">{subtotal.description}</td>
                <td className="p-3 text-sm text-right text-gray-700">
                  {new Intl.NumberFormat('uz-UZ', {
                    style: 'decimal',
                    minimumFractionDigits: 2
                  }).format(subtotal.amount)}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 font-semibold">
              <td className="p-3 text-sm text-gray-800">Total</td>
              <td className="p-3 text-sm text-right text-gray-800">
                {new Intl.NumberFormat('uz-UZ', {
                  style: 'decimal',
                  minimumFractionDigits: 2
                }).format(statement.total)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}