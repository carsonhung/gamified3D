import { Box3, Raycaster, Vector2, Vector3 } from 'three';
import { toDirection, pickInDirection } from './spatial.js';
// Movement beyond this between pointerdown and pointerup is a drag, not a tap.
const TAP_SLOP_PX = 6;
// Visually hidden but still focusable and announced; display:none would remove it from both.
function hideVisually(element) {
    Object.assign(element.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: '0',
        border: '0',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
    });
}
function isVisibleInWorld(object) {
    for (let node = object; node; node = node.parent) {
        if (!node.visible)
            return false;
    }
    return true;
}
export function createInteraction(options) {
    const { camera, canvas } = options;
    const parent = canvas.parentElement;
    if (!parent)
        throw new Error('[gamified3d-interaction] canvas must be in the document before createInteraction');
    const records = new Map();
    const handlers = {
        hover: new Set(),
        focus: new Set(),
        select: new Set(),
    };
    const raycaster = new Raycaster();
    const pointerNdc = new Vector2();
    const bounds = new Box3();
    const centre = new Vector3();
    let hovered = null;
    let focused = null;
    let selected = null;
    let press = null;
    const mirror = document.createElement('div');
    mirror.setAttribute('role', 'group');
    mirror.setAttribute('aria-label', options.label);
    hideVisually(mirror);
    canvas.after(mirror);
    function emit(event, record) {
        for (const handler of handlers[event])
            handler(record);
    }
    function setHovered(record) {
        if (record === hovered)
            return;
        hovered = record;
        canvas.style.cursor = record ? (record.isDisabled ? 'not-allowed' : 'pointer') : '';
        emit('hover', record);
    }
    function setFocused(record) {
        if (record === focused)
            return;
        focused = record;
        emit('focus', record);
    }
    function setSelected(record) {
        if (record === selected)
            return;
        selected?.button.setAttribute('aria-pressed', 'false');
        selected = record;
        selected?.button.setAttribute('aria-pressed', 'true');
        emit('select', record);
    }
    function activate(record) {
        if (!record.isDisabled)
            setSelected(record);
    }
    function pick(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0)
            return null;
        pointerNdc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects([...records.keys()], true);
        for (const hit of hits) {
            for (let node = hit.object; node; node = node.parent) {
                const record = records.get(node);
                if (record && isVisibleInWorld(record.object))
                    return record;
            }
        }
        return null;
    }
    function toScreen(record, rect) {
        bounds.setFromObject(record.object).getCenter(centre).project(camera);
        return { x: ((centre.x + 1) / 2) * rect.width, y: ((1 - centre.y) / 2) * rect.height };
    }
    function onPointerMove(event) {
        if (event.pointerType === 'touch')
            return;
        setHovered(pick(event.clientX, event.clientY));
    }
    function onPointerLeave() {
        setHovered(null);
    }
    function onPointerDown(event) {
        if (event.button !== 0)
            return;
        press = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
    function onPointerUp(event) {
        if (!press || press.id !== event.pointerId)
            return;
        const isTap = Math.hypot(event.clientX - press.x, event.clientY - press.y) <= TAP_SLOP_PX;
        press = null;
        if (!isTap)
            return;
        const record = pick(event.clientX, event.clientY);
        if (record)
            activate(record);
        else
            setSelected(null);
    }
    function onPointerCancel() {
        press = null;
    }
    function onMirrorKeyDown(event) {
        if (event.key === 'Escape') {
            if (!selected)
                return;
            event.preventDefault();
            setSelected(null);
            return;
        }
        const direction = toDirection(event.key);
        if (!direction || !focused)
            return;
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const from = toScreen(focused, rect);
        const candidates = [...records.values()]
            .filter((record) => record !== focused && isVisibleInWorld(record.object))
            .map((record) => ({ point: toScreen(record, rect), item: record }));
        pickInDirection(from, candidates, direction)?.button.focus();
    }
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    mirror.addEventListener('keydown', onMirrorKeyDown);
    function getRecord(target) {
        const record = records.get(target.object);
        if (!record)
            throw new Error(`[gamified3d-interaction] "${target.label}" is not a registered target`);
        return record;
    }
    return {
        get hovered() {
            return hovered;
        },
        get focused() {
            return focused;
        },
        get selected() {
            return selected;
        },
        addTarget(object, targetOptions) {
            if (records.has(object)) {
                throw new Error(`[gamified3d-interaction] "${targetOptions.label}" is already a target`);
            }
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = targetOptions.label;
            button.setAttribute('aria-pressed', 'false');
            const record = {
                object,
                label: targetOptions.label,
                isDisabled: targetOptions.isDisabled ?? false,
                button,
            };
            if (record.isDisabled)
                button.setAttribute('aria-disabled', 'true');
            button.addEventListener('focus', () => setFocused(record));
            button.addEventListener('blur', (event) => {
                if (!mirror.contains(event.relatedTarget))
                    setFocused(null);
            });
            // Native click covers Enter and Space, so keyboard and pointer share one path.
            button.addEventListener('click', () => activate(record));
            records.set(object, record);
            mirror.append(button);
            return record;
        },
        updateTarget(target, next) {
            const record = getRecord(target);
            if (next.label !== undefined) {
                record.label = next.label;
                record.button.textContent = next.label;
            }
            if (next.isDisabled !== undefined) {
                record.isDisabled = next.isDisabled;
                if (next.isDisabled)
                    record.button.setAttribute('aria-disabled', 'true');
                else
                    record.button.removeAttribute('aria-disabled');
                if (next.isDisabled && selected === record)
                    setSelected(null);
                if (hovered === record)
                    canvas.style.cursor = next.isDisabled ? 'not-allowed' : 'pointer';
            }
        },
        removeTarget(target) {
            const record = getRecord(target);
            if (hovered === record)
                setHovered(null);
            if (focused === record)
                setFocused(null);
            if (selected === record)
                setSelected(null);
            record.button.remove();
            records.delete(record.object);
        },
        select(target) {
            setSelected(target ? getRecord(target) : null);
        },
        focus(target) {
            getRecord(target).button.focus();
        },
        on(event, handler) {
            handlers[event].add(handler);
            return () => handlers[event].delete(handler);
        },
        dispose() {
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerleave', onPointerLeave);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointercancel', onPointerCancel);
            canvas.style.cursor = '';
            mirror.remove();
            records.clear();
            for (const set of Object.values(handlers))
                set.clear();
            hovered = focused = selected = null;
        },
    };
}
