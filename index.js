import { startPlay2Server } from "./server.js";

startPlay2Server()
  .then(() => console.log(`[NERO PLAY2] Server aktif pada port ${process.env.PORT || process.env.PLAY2_PORT || 3000}`))
  .catch((error) => {
    console.error("[NERO PLAY2] Gagal menjalankan server:", error);
    process.exit(1);
  });
