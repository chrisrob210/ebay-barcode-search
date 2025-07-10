'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hints = undefined;
        const codeReader = new BrowserMultiFormatReader(hints);

        codeReader
            .listVideoInputDevices()
            .then(videoInputDevices => {
                if (videoInputDevices.length === 0) {
                    setError('No video input devices found.');
                    return;
                }

                codeReader.decodeFromVideoDevice(
                    videoInputDevices[0].deviceId,
                    videoRef.current!,
                    (result, err) => {
                        if (result) {
                            console.log('Barcode detected:', result.getText());
                            codeReader.reset();
                            onScan(result.getText());
                        } else if (err && !(err instanceof NotFoundException)) {
                            console.warn('Scan error:', err);
                            setError('Error scanning barcode.');
                        }
                    }
                );
            })
            .catch(() => setError('Unable to access video devices.'));

        return () => codeReader.reset();
    }, [onScan]);

    return (
        <div
            className="relative w-full bg-black rounded-lg border-0 border-gray-500 overflow-hidden"
            style={{
                boxShadow: '0 0 7px rgba(0, 0, 0, 0.6)'
            }}
        >
            {error ? <p className="text-red-500">{error}</p> : <video ref={videoRef} className="w-full h-full" />}
            <div className="absolute inset-1 pointer-events-none opacity-40 before:content-[''] before:absolute before:top-[25%] before:bottom-[25%] before:left-[10%] before:right-[10%] before:border-x-4 before:border-y-[1px] before:border-slate-200 before:rounded-lg before:shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
        </div>
    );
}
