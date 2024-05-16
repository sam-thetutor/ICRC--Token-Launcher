import React from 'react';
import { TiFlowMerge } from 'react-icons/ti';
import { shorten17String } from '../Utils/functions';
const TransactionTable = ({ data, tokenName }) => {
  return (
    <table className="table-auto min-w-full overflow-y-auto">
      <thead className='border-b-2'>
        <tr>
          <th className=" px-4 py-2">Kind</th>
          <th className=" px-4 py-2">From</th>
          <th className=" px-4 py-2">To</th>
          <th className=" px-4 py-2">Amount ({tokenName})</th>
          <th className=" px-4 py-2">Timestamp</th>
        </tr>
      </thead>
      <tbody >
        {data &&
          data?.map((item, index) => (
            <tr key={index} >
              <td className=" text-white text-center py-2">{item?.kind}</td>
              <td className=" py-2 text-center">
               
                 { shorten17String(item?.from)}
                
              </td>
              <td className=" py-2 text-center">
                {item?.to === 'mintAccount' ? 'sam' : shorten17String(item?.to)}
              </td>
              <td className=" py-2 text-center">{item?.amount}</td>
              <td className=" py-2 text-center">{ new Date(item?.timestamp)?.toLocaleString()}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;