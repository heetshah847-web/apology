import { createRoot } from 'react-dom/client';
import '../../../index.css';
import { PasscodeGate } from '../../gate';
import { MapOpening, AtlasInterlude, MiniMap, MapPins } from '..';

/** Lane 06 harness: /src/features/map/demo/index.html?view=gate|opening|interlude&to=friendship|mini|pins */
const q = new URLSearchParams(location.search);
const view = q.get('view') ?? 'opening';
function Demo() {
  if (view === 'gate') return <PasscodeGate><p id="inside">inside</p></PasscodeGate>;
  if (view === 'interlude') return <div><AtlasInterlude to={(q.get('to') as 'queen' | 'friendship' | 'distance') ?? 'friendship'} /><div style={{ height: '100svh' }} /></div>;
  if (view === 'mini') return <div style={{ height: '100svh' }}><MiniMap phase="love" progress={0.3} /></div>;
  if (view === 'pins') return <div style={{ padding: 20 }}><MapPins stretch={Number(q.get('s') ?? 0.5)} /></div>;
  return <div><MapOpening /><div style={{ height: '100svh' }} /></div>;
}
createRoot(document.getElementById('root')!).render(<Demo />);
