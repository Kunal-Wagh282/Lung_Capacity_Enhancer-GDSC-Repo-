import React from 'react';

function DateInput({ label, value, onChange, id ,message}) {
  // Format the date value as 'YYYY-MM-DD' for the input element
  const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';

  return (
    <div>
      <label htmlFor={id}></label>
      <div className='input'>
      <input 
        type="date"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={message}
        required
      />
        </div>

    </div>
  );
}

export default DateInput;
