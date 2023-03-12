import { useState, useEffect } from 'react'
import axios from 'axios'

function ProductsAPI() {
    const [products, setProducts] = useState([])
    const [callback, setCallback] = useState(false)
    const [category, setCategory] = useState('')
    const [sort, setSort] = useState('')
    const [search, setSearch] = useState('')
    // const [page, setPage] = useState(1)
    const [result, setResult] = useState(0)
    const [productsAvailble, setProductsAvailable] = useState([])
    const [recommended, setRecommended] = useState([])
    const [bestSeller, setBestSeller] = useState([])
    const [newArrival, setNewArrival] = useState([])
    const [searchItem, setSearchItem] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingItem, setLoadingItem] = useState(false)

    useEffect(() => {
        const getProducts = async () => {
            setLoadingItem(true)
            const res = await axios.get(`/api/products?${category}&${sort}&title[regex]=${search}`)
            setProducts(res.data.products)
            setResult(res.data.result)
            setLoadingItem(false)
        }
        getProducts()

        const getProductsAvailable = async () => {
            setLoading(true)
            const res = await axios.get(`/api/products?${category}&${sort}&title[regex]=${search}`)
            setProductsAvailable(res.data.products.filter(product => product.isPublished === true))
            setLoading(false)
        }
        getProductsAvailable()

        const getRecommended = async () => {
            const res = await axios.get('/api/productsHomepage?limit=8&sort=-rating')
            setRecommended(res.data.products)
        }

        getRecommended()

        const getBestSeller = async () => {
            const res = await axios.get('/api/productsHomepage?limit=8&sort=-sold')
            setBestSeller(res.data.products)
        }

        getBestSeller()

        const getNewArrival = async () => {
            const res = await axios.get('/api/productsHomepage?limit=8')
            setNewArrival(res.data.products)
        }

        getNewArrival()

        const getFilterProducts = async () => {
            const res = await axios.get(`/api/products`)
            setSuggestions(res.data.products.filter(product => product.isPublished === true))
        }
        getFilterProducts()

    }, [callback, category, sort, search])



    return {
        products: [products, setProducts],
        callback: [callback, setCallback],
        category: [category, setCategory],
        sort: [sort, setSort],
        search: [search, setSearch],
        // page: [page, setPage],
        result: [result, setResult],
        productsAvailable: [productsAvailble, setProductsAvailable],
        recommended: [recommended, setRecommended],
        bestSeller: [bestSeller, setBestSeller],
        newArrival: [newArrival, setNewArrival],
        searchItem: [searchItem, setSearchItem],
        suggestions: [suggestions, setSuggestions],
        loading: [loading, setLoading],
        loadingItem: [loadingItem, setLoadingItem]
    }
}

export default ProductsAPI