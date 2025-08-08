"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Star, Zap, Shield, TrendingUp, Copy, ExternalLink, Sparkles, Globe, BarChart3, DollarSign, ArrowRight, Info } from 'lucide-react'
import Galaxy from '@/components/Galaxy'

export default function AsterCalculator() {
  const [volume, setVolume] = useState([50000])
  const [tradingMode, setTradingMode] = useState("simple")
  const [timeframe, setTimeframe] = useState("yearly")
  const [showResults, setShowResults] = useState(false)
  const [sliderValue, setSliderValue] = useState([50]) // Internal slider state for smooth updates
  const [displayVolume, setDisplayVolume] = useState(50000) // Instant display value
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimeRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  // Enhanced throttle function with better performance
  const throttle = useCallback((func: Function, delay: number) => {
    let lastCall = 0
    return (...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func(...args)
      }
    }
  }, [])

  // Exponential scaling for better financial data handling
  const expScale = useCallback((value: number, min: number, max: number) => {
    const normalized = value / 100
    const expValue = Math.pow(normalized, 2.5) // Exponential curve for better precision
    return min + (max - min) * expValue
  }, [])

  const inverseExpScale = useCallback((value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min)
    return Math.round(100 * Math.pow(normalized, 1 / 2.5))
  }, [])

  // Smart rounding based on magnitude for better UX
  const smartRound = useCallback((value: number) => {
    if (value < 10000) {
      return Math.round(value / 100) * 100 // Round to nearest 100 for small values
    } else if (value < 100000) {
      return Math.round(value / 1000) * 1000 // Round to nearest 1K for medium values
    } else if (value < 1000000) {
      return Math.round(value / 10000) * 10000 // Round to nearest 10K for large values
    } else {
      return Math.round(value / 100000) * 100000 // Round to nearest 100K for very large values
    }
  }, [])

  // Enhanced motion preference detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Optimized slider change handler with instant visual feedback
  const handleSliderChange = useCallback((value: number[]) => {
    // Instant visual feedback - no delay
    setSliderValue(value)
    
    // Fast debounced calculation (16ms for 60fps)
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const scaledValue = expScale(value[0], 100, 100000000)
      const roundedValue = smartRound(scaledValue)
      setVolume([roundedValue])
      setDisplayVolume(roundedValue)
    }, prefersReducedMotion ? 50 : 16) // 50ms for reduced motion, 16ms for normal
  }, [expScale, smartRound, prefersReducedMotion])

  // Handle slider drag start/end for optimal performance
  const handleSliderDragStart = useCallback(() => {
    setIsSliderDragging(true)
  }, [])

  const handleSliderDragEnd = useCallback(() => {
    setIsSliderDragging(false)
  }, [])

  // Update internal slider value when volume changes externally
  useEffect(() => {
    setSliderValue([inverseExpScale(volume[0], 100, 100000000)])
  }, [volume, inverseExpScale])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Helper function to update volume and sync all states
  const updateVolume = useCallback((newVolume: number) => {
    const roundedValue = smartRound(newVolume)
    setVolume([roundedValue])
    setDisplayVolume(roundedValue)
    setSliderValue([inverseExpScale(roundedValue, 100, 100000000)])
  }, [smartRound, inverseExpScale])

  // Aster official data from https://docs.asterdex.com/product/asterex-pro/pro-fees
  const asterData = {
    makerFee: 0.0001, // 0.01% - official from docs
    takerFee: 0.00035, // 0.035% - official from docs
    volume: "480B",
    users: "1M",
    openInterest: "237M",
    tvl: "347M",
    symbols: 101
  }

  // Competitor data with real fee structures from official sources
  const competitors = {
    gmx: {
      name: "GMX",
      fee: 0.0006, // Average of maker (0.05%) and taker (0.07%)
      bridgeCost: 5,
      makerFee: 0.0005, // 0.05%
      takerFee: 0.0007, // 0.07%
      description: "Decentralized perpetual exchange on Arbitrum/Avalanche"
    },
    dydx: {
      name: "dYdX",
      fee: 0.0005, // Average of maker and taker fees
      bridgeCost: 3,
      makerFee: 0.00039, // 0.039%
      takerFee: 0.0005, // 0.05%
      description: "Decentralized derivatives exchange"
    },
    hyperliquid: {
      name: "Hyperliquid",
      fee: 0.0002, // Very low fees
      bridgeCost: 2,
      makerFee: 0.0001, // 0.01%
      takerFee: 0.00035, // 0.035%
      description: "Layer 1 perpetual exchange"
    },
    binance: {
      name: "Binance",
      fee: 0.0003, // Average of futures maker (0.02%) and taker (0.04%)
      bridgeCost: 8,
      makerFee: 0.0002, // 0.02% - futures maker fee
      takerFee: 0.0004, // 0.04% - futures taker fee
      description: "World's largest centralized exchange"
    },
    bybit: {
      name: "Bybit",
      fee: 0.000375, // Average of perpetual maker (0.02%) and taker (0.055%)
      bridgeCost: 6,
      makerFee: 0.0002, // 0.02%
      takerFee: 0.00055, // 0.055%
      description: "Major centralized exchange"
    },
    coinbase: {
      name: "Coinbase",
      fee: 0.0003, // Average of maker (0.02%) and taker (0.04%) for perpetuals
      bridgeCost: 7,
      makerFee: 0.0002, // 0.02%
      takerFee: 0.0004, // 0.04%
      description: "US-based centralized exchange"
    },
    apex: {
      name: "ApeX",
      fee: 0.0004, // Average of maker and taker fees
      bridgeCost: 4,
      makerFee: 0.0002, // 0.02%
      takerFee: 0.0005, // 0.05%
      description: "Bybit-backed decentralized exchange"
    }
  }

  // Calculate savings based on trading style
  const calculateSavings = () => {
    const monthlyVolume = volume[0]
    
    // Different fee structures based on trading style
    let asterMakerFee = asterData.makerFee
    let asterTakerFee = asterData.takerFee
    
    switch(tradingMode) {
      case "simple":
        // Simple mode: Lower fees, MEV protection
        asterMakerFee = 0.00008 // 0.008% - even lower maker fee
        asterTakerFee = 0.0003  // 0.03% - lower taker fee
        break
      case "pro":
        // Pro mode: Higher fees, advanced features
        asterMakerFee = 0.00015 // 0.015% - higher maker fee
        asterTakerFee = 0.0004  // 0.04% - higher taker fee
        break
      case "hybrid":
      default:
        // Hybrid mode: Balanced fees
        asterMakerFee = asterData.makerFee // 0.01% - default
        asterTakerFee = asterData.takerFee // 0.035% - default
        break
    }
    
    const asterFee = monthlyVolume * ((asterMakerFee + asterTakerFee) / 2)
    
    const savings = Object.entries(competitors).map(([key, comp]) => {
      const competitorFee = monthlyVolume * comp.fee
      const bridgeCosts = comp.bridgeCost * 4 // Assume 4 bridge transactions per month
      const totalCompetitorCost = competitorFee + bridgeCosts
      const monthlySavings = totalCompetitorCost - asterFee
      
      return {
        name: comp.name,
        monthlySavings,
        yearlySavings: monthlySavings * 12,
        lifetimeSavings: monthlySavings * 60, // 5 years
        percentage: ((monthlySavings / totalCompetitorCost) * 100)
      }
    })

    return savings
  }

  const savings = calculateSavings()
  const maxSavings = Math.max(...savings.map(s => s.yearlySavings))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper function to open external links reliably
  const openExternalLink = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareOnTwitter = () => {
    const bestSaving = savings.reduce((max, current) => 
      current.yearlySavings > max.yearlySavings ? current : max
    )
    const text = `I save ${formatCurrency(bestSaving.yearlySavings)} yearly trading on @Aster_DEX! 🚀\n\nHidden orders + 0.01% maker fees + cross-chain liquidity = pure alpha 💎\n\nDecentralized perpetual contracts with $${asterData.volume} volume. The future is here! ⭐\n\nCalculate your savings:`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    
    openExternalLink(shareUrl)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy 
          density={0.5}
          glowIntensity={0.3}
          saturation={0.1}
          hueShift={30}
          mouseInteraction={true}
          mouseRepulsion={true}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
          transparent={false}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-[#efbf84] via-[#f4d4a4] to-[#efbf84] bg-clip-text text-transparent">
              Calculate Your Savings
            </span>
            <span className="block text-white mt-2">
              with Aster DEX
            </span>
          </h1>
          
          <h2 className="text-2xl font-semibold text-white mb-3 leading-tight">
            <span className="bg-gradient-to-r from-[#efbf84] to-[#f4d4a4] bg-clip-text text-transparent">
              Compared to Other Trading Platforms
            </span>
          </h2>
          
          <p className="text-base text-[#efbf84] mb-4 max-w-2xl mx-auto">
            Multi-chain, liquid, secure. Compare your savings with ultra-low fees and cross-chain liquidity
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <div className="glass-effect rounded-xl px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div className="text-lg font-bold text-white">${asterData.volume}</div>
              <div className="text-xs text-[#efbf84]">Total Volume</div>
            </div>
            <div className="glass-effect rounded-xl px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div className="text-lg font-bold text-white">{asterData.users}</div>
              <div className="text-xs text-[#efbf84]">Users</div>
            </div>
            <div className="glass-effect rounded-xl px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div className="text-lg font-bold text-white">${asterData.openInterest}</div>
              <div className="text-xs text-[#efbf84]">Open Interest</div>
            </div>
            <div className="glass-effect rounded-xl px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div className="text-lg font-bold text-white">${asterData.tvl}</div>
              <div className="text-xs text-[#efbf84]">TVL</div>
            </div>
            <div className="glass-effect rounded-xl px-4 py-2" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div className="text-lg font-bold text-white">{asterData.symbols}</div>
              <div className="text-xs text-[#efbf84]">Symbols</div>
            </div>
          </div>
        </div>

        {/* Main Calculator Grid - Single Screen Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Calculator */}
          <div className="space-y-4">
            <Card className="glass-effect" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-[#efbf84]" />
                  Fee Calculator
                </CardTitle>
                <p className="text-[#efbf84] text-xs">Compare your trading costs</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <label className="text-white font-semibold text-sm block">Monthly Volume</label>
                      <p className="text-[#efbf84] text-xs">Adjust your trading volume</p>
                    </div>
                                          <div className="text-right">
                        <div className="text-xl font-bold text-white volume-display">
                          {formatCurrency(displayVolume)}
                        </div>
                      </div>
                  </div>
                  
                  <div className="relative">
                    <Slider
                      value={sliderValue}
                      onValueChange={handleSliderChange}
                      onDragStart={handleSliderDragStart}
                      onDragEnd={handleSliderDragEnd}
                      max={100}
                      min={0}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-[#efbf84]">
                      <span>$100</span>
                      <span>$100M+</span>
                    </div>
                  </div>
                  
                  {/* Compact Preset buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => updateVolume(100000)}
                      className="glossy-button text-[#efbf84] hover:text-white text-xs px-3 py-1 h-7 rounded-md"
                    >
                      $100K
                    </Button>
                    <Button 
                      onClick={() => updateVolume(500000)}
                      className="glossy-button text-[#efbf84] hover:text-white text-xs px-3 py-1 h-7 rounded-md"
                    >
                      $500K
                    </Button>
                    <Button 
                      onClick={() => updateVolume(1000000)}
                      className="glossy-button text-[#efbf84] hover:text-white text-xs px-3 py-1 h-7 rounded-md"
                    >
                      $1M
                    </Button>
                    <Button 
                      onClick={() => updateVolume(10000000)}
                      className="glossy-button text-[#efbf84] hover:text-white text-xs px-3 py-1 h-7 rounded-md hidden sm:inline-flex"
                    >
                      $10M
                    </Button>
                    <Button 
                      onClick={() => updateVolume(100000000)}
                      className="glossy-button text-[#efbf84] hover:text-white text-xs px-3 py-1 h-7 rounded-md hidden md:inline-flex"
                    >
                      $100M
                    </Button>
                    <input
                      type="number"
                      placeholder="Custom $"
                      className="bg-black/30 border border-white/20 rounded-md px-3 py-1 h-7 text-white text-xs placeholder-[#efbf84] focus:outline-none focus:border-[#efbf84] transition-colors w-24"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value > 0) {
                          updateVolume(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value > 0) {
                          updateVolume(value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Trading Mode & Timeframe */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm block">Trading Style</label>
                    <Tabs value={tradingMode} onValueChange={setTradingMode}>
                      <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/20 h-8">
                        <TabsTrigger 
                          value="simple" 
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          Simple
                        </TabsTrigger>
                        <TabsTrigger 
                          value="pro" 
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          Pro
                        </TabsTrigger>
                        <TabsTrigger 
                          value="hybrid" 
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          Hybrid
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm block">Timeframe</label>
                    <Tabs value={timeframe} onValueChange={setTimeframe}>
                      <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/20 h-8">
                        <TabsTrigger 
                          value="monthly"
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          Monthly
                        </TabsTrigger>
                        <TabsTrigger 
                          value="yearly"
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          Yearly
                        </TabsTrigger>
                        <TabsTrigger 
                          value="lifetime"
                          className="data-[state=active]:bg-[#efbf84] data-[state=active]:text-black text-[#efbf84] text-xs"
                        >
                          5 Years
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setShowResults(true);
                    // Scroll to results on mobile
                    if (window.innerWidth < 1024) { // lg breakpoint
                      setTimeout(() => {
                        document.getElementById('results-section')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }
                  }}
                  className="w-full star-gradient hover:from-[#f4d4a4] hover:to-[#efbf84] text-black font-bold py-2 text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 orange-glow"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Calculate Savings
                </Button>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 group" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 star-gradient rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-5 h-5 text-black" />
                  </div>
                  <CardTitle className="text-white text-sm">Cross-Chain</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <p className="text-[#efbf84] text-xs">No bridging required</p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 group" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 star-gradient rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <CardTitle className="text-white text-sm">Hidden Orders</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <p className="text-[#efbf84] text-xs">Invisible order book</p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 group" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 star-gradient rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-5 h-5 text-black" />
                  </div>
                  <CardTitle className="text-white text-sm">Current Fees</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[#efbf84] text-xs">
                      {tradingMode === "simple" ? "0.008% maker" : 
                       tradingMode === "pro" ? "0.015% maker" : 
                       "0.01% maker"}
                    </p>
                    <div className="group relative">
                      <Info className="w-3 h-3 text-[#efbf84] cursor-help hover:text-white transition-colors" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-[180px]">
                        <div className="text-white text-xs font-semibold mb-1">Aster DEX Fee Structure</div>
                        <div className="text-[#efbf84] text-xs space-y-1">
                          <div>Maker Fee: {tradingMode === "simple" ? "0.008%" : tradingMode === "pro" ? "0.015%" : "0.01%"}</div>
                          <div>Taker Fee: {tradingMode === "simple" ? "0.03%" : tradingMode === "pro" ? "0.04%" : "0.035%"}</div>
                          <div>Bridge Cost: $0 (Cross-chain)</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:bg-white/5 transition-all duration-300 group" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 star-gradient rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-black" />
                  </div>
                  <CardTitle className="text-white text-sm">
                    {tradingMode === "simple" ? "MEV Protection" : 
                     tradingMode === "pro" ? "Advanced Tools" : 
                     "Balanced Mode"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <p className="text-[#efbf84] text-xs">
                    {tradingMode === "simple" ? "Built-in protection" : 
                     tradingMode === "pro" ? "Hidden orders" : 
                     "Mixed approach"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Results */}
          <div id="results-section" className="space-y-4">
            {!showResults ? (
              <Card className="glass-effect h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div className="text-center p-8">
                  <TrendingUp className="w-12 h-12 text-[#efbf84] mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Your Aster Advantage</h3>
                  <p className="text-[#efbf84] text-sm">Click "Calculate Savings" to see your potential savings compared to other platforms</p>
                </div>
              </Card>
            ) : (
              <Card className="glass-effect" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-[#efbf84]" />
                    Your Savings
                  </CardTitle>
                  <p className="text-[#efbf84] text-xs">vs other platforms</p>
                </CardHeader>
                <CardContent className="pt-2 space-y-2">
                                     {savings.map((saving, index) => {
                     const timeframeSaving = saving[`${timeframe}Savings` as keyof typeof saving] as number
                     // Use the percentage savings for more accurate visual representation
                     const progressValue = Math.min(Math.max(saving.percentage, 5), 100)
                     
                     // Find the competitor data for tooltip
                     const competitorKey = Object.keys(competitors).find(key => 
                       competitors[key as keyof typeof competitors].name === saving.name
                     )
                     const competitor = competitorKey ? competitors[competitorKey as keyof typeof competitors] : null
                     
                     return (
                       <div key={index} className="bg-black/30 rounded-md p-2 border border-white/10">
                         <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center gap-2">
                             <span className="text-white font-semibold text-xs">vs {saving.name}</span>
                             {competitor && (
                               <div className="group relative">
                                 <Info className="w-3 h-3 text-[#efbf84] cursor-help hover:text-white transition-colors" />
                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-[200px]">
                                   <div className="text-white text-xs font-semibold mb-1">{competitor.description}</div>
                                   <div className="text-[#efbf84] text-xs space-y-1">
                                     <div>Maker Fee: {(competitor.makerFee * 100).toFixed(3)}%</div>
                                     <div>Taker Fee: {(competitor.takerFee * 100).toFixed(3)}%</div>
                                     <div>Bridge Cost: ${competitor.bridgeCost}</div>
                                   </div>
                                   <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                 </div>
                               </div>
                             )}
                           </div>
                           <div className="text-right">
                             <div className="text-sm font-bold text-white">
                               {formatCurrency(timeframeSaving)}
                             </div>
                             <div className="text-xs text-[#efbf84]">
                               {saving.percentage.toFixed(1)}% savings
                             </div>
                           </div>
                         </div>
                         <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                           <div 
                             className="star-gradient h-1.5 rounded-full transition-all duration-1000 ease-out"
                             style={{ width: `${progressValue}%` }}
                           ></div>
                         </div>
                       </div>
                     )
                   })}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={shareOnTwitter}
                      className="glossy-button text-[#efbf84] hover:text-white font-semibold px-3 py-2 rounded-lg text-xs transition-all duration-200 flex-1 h-9"
                    >
                      <span className="inline-flex items-center justify-center w-3 h-3 mr-1 text-[16px] font-bold" style={{ lineHeight: '1' }}>𝕏</span>
                      Share
                    </Button>
                    <Button 
                      onClick={() => openExternalLink('https://www.asterdex.com/en/referral/F04A89')}
                      className="star-gradient hover:from-[#f4d4a4] hover:to-[#efbf84] text-black font-semibold px-3 py-2 rounded-lg text-xs orange-glow flex-1 h-9"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Trade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Barely visible contact link */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="https://x.com/MaxDziura" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#efbf84]/20 hover:text-[#efbf84]/40 text-xs transition-colors duration-300 font-light"
          title="Found an error or need fee adjustments? Contact me"
        >
          contact
        </a>
      </div>
    </div>
  )
}
