import axios from 'axios'

const api = axios.create({
    baseURL: 'http://54.249.145.17:8080/',
})

export default api
