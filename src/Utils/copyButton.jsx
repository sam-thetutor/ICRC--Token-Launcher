
import React from 'react'
import { IoCopyOutline } from "react-icons/io5";

function copyButton({ textToCopy }) {

    const copyToClipboard = async (text) => {
        if (!navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            alert("text copied")
            console.log('Text copied to clipboard :', text);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
    return (
        <IoCopyOutline color='black' className='cursor-pointer' size={15} onClick={() => copyToClipboard(textToCopy)} />
    )
}

export default copyButton
