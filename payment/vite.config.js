import {defineConfig} from "vite";
import {resolve} from 'path'
export default defineConfig({
    envPrefix:'APP',
    root:resolve(__dirname,'./src'),
    envDir:resolve(__dirname,''),
    build:{
        target:'es2015',
        outDir:'../build',
        rollupOptions:{
            input:{
                main:resolve(__dirname,'./src/index.html'),
                transaction:resolve(__dirname,'./src/transaction.html'),
                verify:resolve(__dirname,'./src/verify.html'),
            }
        }
    },
    server:{
        port:9000
    }
})