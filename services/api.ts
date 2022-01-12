import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies()

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      // renovar token
      // pega os cookies antigos
      cookies = parseCookies();
      // armazena o refreshToken antigo na const refreshToken
      const { 'nextauth.refreshToken': refreshToken } = cookies;
      
      // faz um post na rota refresh mandando esse refreshToken antigo, que retorna
      // um response onde pegamos o novo token desse response.data e então setamos nos cookies
      // esse novo token e um novo refreshToken
      api.post('/refresh', {
        refreshToken,
      }).then(response => {
        const { token } = response.data;

        setCookie(undefined, 'nextauth.token', token, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })
        setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
          maxAge: 60 * 60 * 24 * 30,
          path: '/'
        })
        // seta no headers de Authorization o Bearer com o novo token
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
      })

    } else {
      // deslogar usuário
    }
  }
})