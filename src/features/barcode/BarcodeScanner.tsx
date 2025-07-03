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
        <div className="w-full aspect-video bg-black">
            {error ? <p className="text-red-500">{error}</p> : <video ref={videoRef} className="w-full h-full" />}
        </div>
    );
}
