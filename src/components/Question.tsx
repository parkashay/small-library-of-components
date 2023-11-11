import { ReactNode } from 'react'

const Question = ({children}:{children: ReactNode}) => {
  return (
    <div className='text-lg font-semibold my-6 border-b pb-2'>
        {children}
    </div>
  )
}

export default Question