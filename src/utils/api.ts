import axios from 'axios'

const api = axios.create({
    baseURL: 'http://54.238.232.62:8080/',
})

export default api
