---
inject: true
to: "<%= attach ? `src/components/views/${view}.js` : null %>"
after: "'react'"
skip_if: "cartoSlice'"
---
import { addLayer, removeLayer } from 'config/cartoSlice';