const mineflayer = require('mineflayer');

let afkInterval = null;

function createBot() {
    // Limpia temporizadores previos para no duplicar acciones
    if (afkInterval) clearInterval(afkInterval);

    const bot = mineflayer.createBot({
        host: 'logcraft.mcsh.io',
        port: 25565,           // Cambia este puerto si tu hosting te dio uno de 5 dígitos
        username: 'BotLog', 
        version: '1.21.4'      // Fija la versión exacta de tu servidor (ej. '1.20.1', '1.20.4' o '1.21')
    });

    bot.on('login', () => {
        console.log('[NPC] Conexión establecida con LogCraft.');
    });

    bot.on('spawn', () => {
        console.log('[NPC] El bot ha aparecido correctamente en LogCraft.');
        
        // Ejecuta el registro y luego el inicio de sesión con 3 segundos de margen
        setTimeout(() => {
            bot.chat('/register cubo16 cubo16');
            setTimeout(() => {
                bot.chat('/login cubo16');
            }, 1500);
        }, 3000);
    });

    // Muestra en texto claro la razón exacta por la que el servidor expulsa al bot
    bot.on('kicked', (reason) => {
        let mensaje = reason;
        try {
            mensaje = JSON.stringify(reason);
        } catch (e) {}
        console.log(`[NPC] El servidor expulsó al bot por: ${mensaje}`);
    });

    // Rutina anti-AFK
    afkInterval = setInterval(async () => {
        if (!bot || !bot.entity) return;

        try {
            const chestBlock = bot.findBlock({
                matching: bot.registry.blocksByName.chest ? bot.registry.blocksByName.chest.id : 54,
                maxDistance: 5
            });

            if (chestBlock) {
                console.log('[NPC] Interactuando con el contenedor...');
                const chest = await bot.openChest(chestBlock);
                await new Promise(resolve => setTimeout(resolve, 2000));
                chest.close();
                console.log('[NPC] Contenedor cerrado.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            console.log('[NPC] Acción anti-inactividad ejecutada.');

        } catch (err) {
            console.log(`[NPC] Aviso en rutina anti-AFK: ${err.message}`);
        }
    }, 45000);

    bot.on('end', (reason) => {
        if (afkInterval) clearInterval(afkInterval);
        console.log(`[NPC] Conexión finalizada (${reason}). Reintentando en 15 segundos...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => console.log(`[NPC] Error de red: ${err.message}`));
}

createBot();
