'use client';

import { useState } from 'react';

type GifPngFrame = { id: string; url: string };
const dragFrames = new Map<string, Blob>();
const dragType = 'application/x-pet-gif-frames';

export const getGifDropFiles = (transfer: DataTransfer): File[] => {
  const ids = transfer.getData(dragType).split(',').filter(Boolean);
  return ids.flatMap((id, index) => {
    const blob = dragFrames.get(id);
    return blob ? [new File([blob], `gif-frame-${index + 1}.png`, { type: 'image/png' })] : [];
  });
};

export const GifFrameTools = ({ onConverted }: { onConverted: (message: string) => void }) => {
  const [frames, setFrames] = useState<GifPngFrame[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const convert = async (file?: File) => {
    if (!file) return;
    setError('');
    const Decoder = (
      window as unknown as {
        ImageDecoder?: new (options: { data: ArrayBuffer; type: string }) => {
          tracks: {
            ready: Promise<void>;
            selectedTrack?: { frameCount: number };
          };
          decode: (options: { frameIndex: number; completeFramesOnly: boolean }) => Promise<{
            image: ImageBitmap & {
              displayWidth?: number;
              displayHeight?: number;
              close?: () => void;
            };
          }>;
          close: () => void;
        };
      }
    ).ImageDecoder;
    if (!Decoder) {
      setError('This browser cannot split GIF frames. Try a recent version of Chrome or Edge.');
      return;
    }

    setConverting(true);
    try {
      const decoder = new Decoder({
        data: await file.arrayBuffer(),
        type: 'image/gif',
      });
      await decoder.tracks.ready;
      const count = decoder.tracks.selectedTrack?.frameCount ?? 0;
      const converted: GifPngFrame[] = [];
      for (let index = 0; index < count; index += 1) {
        const { image } = await decoder.decode({
          frameIndex: index,
          completeFramesOnly: true,
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.displayWidth || image.width;
        canvas.height = image.displayHeight || image.height;
        const context = canvas.getContext('2d');
        if (!context || !canvas.width || !canvas.height) {
          throw new Error(
            'This browser could not create a canvas for the GIF frame. Try opening the editor in Chrome or Edge.',
          );
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob>((resolve, reject) => {
          if (typeof canvas.toBlob === 'function') {
            canvas.toBlob((value) => {
              if (value) {
                resolve(value);
                return;
              }
              try {
                void fetch(canvas.toDataURL('image/png'))
                  .then((response) => response.blob())
                  .then(resolve, reject);
              } catch {
                reject(
                  new Error(
                    'This browser could not encode the GIF frame as PNG. Try opening the editor in Chrome or Edge.',
                  ),
                );
              }
            }, 'image/png');
          } else {
            try {
              void fetch(canvas.toDataURL('image/png'))
                .then((response) => response.blob())
                .then(resolve, reject);
            } catch {
              reject(
                new Error(
                  'This browser does not support PNG encoding. Try opening the editor in Chrome or Edge.',
                ),
              );
            }
          }
        });
        const id = crypto.randomUUID();
        dragFrames.set(id, blob);
        converted.push({ id, url: URL.createObjectURL(blob) });
        image.close?.();
      }
      decoder.close();
      setFrames((previous) => {
        previous.forEach((frame) => {
          URL.revokeObjectURL(frame.url);
          dragFrames.delete(frame.id);
        });
        return converted;
      });
      onConverted(
        `Converted ${converted.length} GIF frames to PNG. Drag frames into the cells below.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not convert this GIF.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <div className="gif-tools-header">
        <p className="gif-instructions">
          Double-click a cell to upload. Click to select;
          <br />
          Ctrl/Cmd+C and Ctrl/Cmd+V to copy and paste.
          <br />
          Working from a GIF? Convert it here, then drag the PNG frames into the cells below.
        </p>
        <label className="ui-button gif-picker">
          {converting ? 'Converting…' : 'GIF to PNG'}
          <input
            hidden
            type="file"
            accept="image/gif,.gif"
            disabled={converting}
            onChange={(event) => {
              setIsOpen(true);
              void convert(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      {isOpen && (
        <div className="ui-panel frame-toolbar">
          {frames.length > 0 && (
            <div className="gif-frames" aria-label="Converted GIF frames">
              {frames.map((frame, index) => (
                <img
                  key={frame.id}
                  src={frame.url}
                  alt={`GIF frame ${index + 1}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(dragType, frame.id);
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  title={`Drag PNG frame ${index + 1} into a cell`}
                />
              ))}
            </div>
          )}
          {error && (
            <p className="gif-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
};
