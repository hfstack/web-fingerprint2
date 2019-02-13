import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import { uglify } from 'rollup-plugin-uglify';
const env = process.env.NODE_ENV;
let configs = {
    input: './src/main.js',
    output: {
      name: 'everfiger',
      file: './dist/webfiger.min.js',
      format: 'iife',
      sourcemap: false
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'            //排除node_modules文件夹;
      }),
      commonjs(),
      uglify()
    ]
  }
  if(env !== 'production') {
    configs.plugins = configs.plugins.concat([
      serve({
        contentBase: 'dist/',   //启动文件夹;
        host: 'localhost',      //设置服务器;
        port: 10001             //端口号;
      }), 
      livereload({
        watch: 'dist/'     //监听文件夹;
      })
    ])
  }
  export default configs