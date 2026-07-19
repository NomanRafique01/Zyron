from PIL import Image
import numpy as np
import queue

files = [
    'assets/agent-icons/archivist.png',
]

def flood_bg_mask(px, w, h, threshold=235, channel_diff=22):
    mask = np.zeros((h, w), dtype=bool)
    visited = np.zeros((h, w), dtype=bool)
    q = queue.Queue()
    for cx, cy in [(0, 0), (0, h - 1), (w - 1, 0), (w - 1, h - 1)]:
        if not visited[cy, cx]:
            q.put((cx, cy))
            visited[cy, cx] = True
    while not q.empty():
        x, y = q.get()
        pix = px[x, y]
        pr, pg, pb = int(pix[0]), int(pix[1]), int(pix[2])
        if (pr >= threshold and pg >= threshold and pb >= threshold
                and abs(pr - pg) < channel_diff and abs(pg - pb) < channel_diff):
            mask[y, x] = True
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.put((nx, ny))
    return mask

def dilate_mask(mask):
    d = mask.copy()
    d[1:] |= mask[:-1]
    d[:-1] |= mask[1:]
    d[:, 1:] |= mask[:, :-1]
    d[:, :-1] |= mask[:, 1:]
    return d

for path in files:
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    px = img.load()

    bg_mask = flood_bg_mask(px, w, h, threshold=235, channel_diff=22)

    data = np.array(img)
    data[bg_mask, 3] = 0

    # Feather 1-px edge: near-white anti-alias pixels get proportionally reduced alpha
    edge = dilate_mask(bg_mask) & ~bg_mask
    er = data[edge, 0].astype(float)
    eg = data[edge, 1].astype(float)
    eb = data[edge, 2].astype(float)
    whiteness = np.clip((er + eg + eb) / 3.0 - 200, 0, 55) / 55.0
    data[edge, 3] = np.clip(data[edge, 3] * (1.0 - whiteness * 0.8), 0, 255).astype(np.uint8)

    Image.fromarray(data.astype(np.uint8), 'RGBA').save(path, 'PNG')
    print(f'Done: {path}')
