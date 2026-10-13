import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, MapPin, Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchApprovedSalons, searchSalons } from '../../features/salon/salonSlice'
import SalonCard, { SalonCardSkeleton } from '../../components/common/SalonCard'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { Salon } from '../../types'

type SortOption = 'rating' | 'price-asc' | 'price-desc' | 'reviews'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating',      label: '⭐ Top Rated'    },
  { value: 'reviews',     label: '💬 Most Reviewed' },
  { value: 'price-asc',   label: '₹ Price: Low–High' },
  { value: 'price-desc',  label: '₹ Price: High–Low' },
]

const sortSalons = (salons: Salon[], sort: SortOption) => {
  const arr = [...salons]
  if (sort === 'rating')      return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  if (sort === 'reviews')     return arr.sort((a, b) => (b.totalReviews ?? 0) - (a.totalReviews ?? 0))
  if (sort === 'price-asc')   return arr.sort((a, b) => (a.minimumBookingFee ?? 0) - (b.minimumBookingFee ?? 0))
  if (sort === 'price-desc')  return arr.sort((a, b) => (b.minimumBookingFee ?? 0) - (a.minimumBookingFee ?? 0))
  return arr
}

const SalonsListPage = () => {
  const dispatch = useAppDispatch()
  const { salons, searchResults, loading, totalPages } = useAppSelector(s => s.salon)
  const [query,    setQuery]    = useState('')
  const [page,     setPage]     = useState(0)
  const [searched, setSearched] = useState(false)
  const [sort,     setSort]     = useState<SortOption>('rating')
  const [cityFilter, setCityFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchApprovedSalons({ page, size: 12 }))
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      dispatch(searchSalons({ query }))
      setSearched(true)
    } else {
      setSearched(false)
    }
  }

  const clearAll = () => {
    setSearched(false)
    setQuery('')
    setCityFilter('')
    setSort('rating')
  }

  // Derive unique cities from loaded salons for the filter dropdown
  const cities = useMemo(() => {
    const all = [...salons, ...searchResults]
    return [...new Set(all.map(s => s.city).filter(Boolean))].sort()
  }, [salons, searchResults])

  const rawSalons = searched ? searchResults : salons

  const displaySalons = useMemo(() => {
    let filtered = rawSalons
    if (cityFilter) filtered = filtered.filter(s => s.city === cityFilter)
    return sortSalons(filtered, sort)
  }, [rawSalons, cityFilter, sort])

  const hasActiveFilters = searched || cityFilter || sort !== 'rating'

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero header */}
        <div className="page-container mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-1">Browse Salons</h1>
              <p className="text-slate-400 text-sm">
                {loading ? 'Loading…' : `${displaySalons.length} salon${displaySalons.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${
                filtersOpen || hasActiveFilters
                  ? 'border-primary-500/60 bg-primary-600/10 text-primary-400'
                  : 'border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters {hasActiveFilters && <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">!</span>}
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                id="salons-search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or city…"
                className="input-field pl-10 py-3"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 sm:flex-none px-5 py-3 min-h-[44px]">Search</button>
              {hasActiveFilters && (
                <button type="button" onClick={clearAll} className="btn-secondary py-3 px-3 text-sm min-h-[44px]">
                  <X size={15} />
                </button>
              )}
            </div>
          </form>

          {/* Expanded filter panel */}
          {filtersOpen && (
            <div className="mt-4 glass-card p-4 rounded-2xl animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* City filter */}
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1">
                    <MapPin size={11} /> Filter by City
                  </label>
                  <select
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    className="input-field py-2.5"
                  >
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Sort */}
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1">
                    <Star size={11} /> Sort By
                  </label>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortOption)}
                    className="input-field py-2.5"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Salon grid */}
        <div className="page-container">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
              {Array.from({ length: 8 }).map((_, i) => <SalonCardSkeleton key={i} />)}
            </div>
          ) : displaySalons.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
                {displaySalons.map(salon => <SalonCard key={salon.id} salon={salon} />)}
              </div>

              {/* Pagination — responsive, touch-friendly, scrollable */}
              {!searched && !cityFilter && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 overflow-x-auto touch-scroll py-2 px-2 max-w-full">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none min-h-[38px] transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-9 h-9 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 flex items-center justify-center ${
                        i === page ? 'bg-primary-600 text-white shadow-glow font-bold' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none min-h-[38px] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center glass-card rounded-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-30"
                style={{ background: 'rgba(124,58,237,0.2)' }}>
                <Search size={30} className="text-primary-400" />
              </div>
              <p className="text-white font-semibold mb-2">No salons found</p>
              <p className="text-slate-500 text-sm mb-5">Try adjusting your search or filters.</p>
              <button onClick={clearAll} className="btn-primary px-6 py-2.5 text-sm">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SalonsListPage
