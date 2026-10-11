import math, wave, struct, random
from pathlib import Path
root=Path(__file__).parent/'public/assets'; rate=22050
# Original short instrumental sketches. No recordings or third-party samples.
for song,(base,bpm) in enumerate([(220,90),(261.63,110),(174.61,75),(196,100),(246.94,120),(164.81,80)]):
    rng=random.Random(song); notes=[1,1.25,1.5,2,1.5,1.25,1.125,1.5]; duration=32
    with wave.open(str(root/f'track-{song}.wav'),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate)
        frames=bytearray()
        for i in range(rate*duration):
            t=i/rate; beat=t*bpm/60; step=int(beat*2); phase=(beat*2)%1
            f=base*notes[(step+song)%len(notes)]; env=math.exp(-4*phase)
            melody=(math.sin(2*math.pi*f*t)+.25*math.sin(4*math.pi*f*t))*.19*env
            bass=math.sin(2*math.pi*base/2*t)*.12*math.exp(-3*(beat%1))
            kick=math.sin(2*math.pi*(55*t+2*(1-math.exp(-25*(beat%1)))))*.13*math.exp(-18*(beat%1))
            hat=(rng.random()*2-1)*.035*math.exp(-30*phase)
            fade=min(1,t/1.5,(duration-t)/2)
            frames+=struct.pack('<h',int(max(-1,min(1,(melody+bass+kick+hat)*fade))*32767))
        w.writeframes(frames)
