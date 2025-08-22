import axios from 'axios'
export const rest = axios.create({
    baseURL: import.meta.env.VITE_URL,
    headers: {
        Authorization: import.meta.env.VITE_ALTEG_TOKEN,
        Accept: 'application/vnd.api.v2+json'
    }
})


export const sendRequest = (data: {url: string, data?: any, method?: string}) => {
    data.url = `${import.meta.env.VITE_ALTEG_URL}/${data.url}`
    return rest.post('send', data)
}
