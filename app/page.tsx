"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Star, Zap, Shield, TrendingUp, Copy, ExternalLink, Sparkles, Globe, BarChart3, DollarSign, ArrowRight, Info, Crown, Award } from 'lucide-react'
import Galaxy from '@/components/Galaxy'

// VIP Tier definitions
const VIP_TIERS = {
  VIP_1: { name: "VIP 1", volume: 0, takerFee: 0.00035, makerFee: 0.0001 },
  VIP_2: { name: "VIP 2", volume: 5000000, takerFee: 0.00034, makerFee: 0.00008 },
  VIP_3: { name: "VIP 3", volume: 25000000, takerFee: 0.00032, makerFee: 0.00005 },
  VIP_4: { name: "VIP 4", volume: 100000000, takerFee: 0.00030, makerFee: 0 },
  VIP_5: { name: "VIP 5", volume: 500000000, takerFee: 0.00028, makerFee: 0 },
  VIP_6: { name: "VIP 6", volume: 1000000000, takerFee: 0.00025, makerFee: 0 }
}

// Market Maker tiers
const MM_TIERS = {
  MM_1: { name: "MM 1", volume: 100000000, makerVolume: 0.005, takerFee: 0.00030, makerRebate: 0.000025 },
  MM_2: { name: "MM 2", volume: 500000000, makerVolume: 0.02, takerFee: 0.00028, makerRebate: 0.00005 }
}

// Hyperliquid fee tiers (perpetuals)
const HYPERLIQUID_TIERS = {
  BASE: { volume: 0, takerFee: 0.00045, makerFee: 0.00015 },
  TIER_1: { volume: 5000000, takerFee: 0.00040, makerFee: 0.00012 },
  TIER_2: { volume: 25000000, takerFee: 0.00035, makerFee: 0.00008 },
  TIER_3: { volume: 100000000, takerFee: 0.00030, makerFee: 0.00004 },
  TIER_4: { volume: 500000000, takerFee: 0.00028, makerFee: 0 },
  TIER_5: { volume: 2000000000, takerFee: 0.00026, makerFee: 0 },
  TIER_6: { volume: 7000000000, takerFee: 0.00024, makerFee: 0 }
}

// Hyperliquid maker rebate tiers
const HYPERLIQUID_MAKER_REBATES = {
  TIER_1: { makerVolume: 0.005, rebate: 0.00001 }, // 0.1%
  TIER_2: { makerVolume: 0.015, rebate: 0.00002 }, // 0.2%
  TIER_3: { makerVolume: 0.030, rebate: 0.00003 }  // 0.3%
}

// Binance VIP tiers (30-day volume based, no BNB 10% discount applied)
const BINANCE_TIERS = [
  { name: "Regular", volume: 0, makerFee: 0.00020, takerFee: 0.00050 }, // < $15M
  { name: "VIP 1", volume: 15000000, makerFee: 0.00016, takerFee: 0.00040 },
  { name: "VIP 2", volume: 50000000, makerFee: 0.00014, takerFee: 0.00035 },
  { name: "VIP 3", volume: 100000000, makerFee: 0.00012, takerFee: 0.00032 },
  { name: "VIP 4", volume: 600000000, makerFee: 0.00010, takerFee: 0.00030 },
  { name: "VIP 5", volume: 1000000000, makerFee: 0.00008, takerFee: 0.00027 },
  { name: "VIP 6", volume: 2500000000, makerFee: 0.00006, takerFee: 0.00025 },
  { name: "VIP 7", volume: 5000000000, makerFee: 0.00004, takerFee: 0.00022 },
  { name: "VIP 8", volume: 12500000000, makerFee: 0.00002, takerFee: 0.00020 },
  { name: "VIP 9", volume: 25000000000, makerFee: 0.00000, takerFee: 0.00017 },
]

// Bybit VIP tiers (30-day derivatives volume; thresholds approximated from public schedules)
const BYBIT_TIERS = [
  { name: "Non-VIP", volume: 0, makerFee: 0.00020, takerFee: 0.00055 },
  { name: "VIP1", volume: 10000000, makerFee: 0.00018, takerFee: 0.00040 },
  { name: "VIP2", volume: 25000000, makerFee: 0.00016, takerFee: 0.000375 },
  { name: "VIP3", volume: 50000000, makerFee: 0.00014, takerFee: 0.00035 },
  { name: "VIP4", volume: 100000000, makerFee: 0.00012, takerFee: 0.00032 },
  { name: "VIP5", volume: 250000000, makerFee: 0.00010, takerFee: 0.00032 },
  { name: "Supreme VIP", volume: 500000000, makerFee: 0.00000, takerFee: 0.00030 },
]

// Coinbase Exchange tiers (30-day trailing USD volume, no stable pair adjustments here)
const COINBASE_TIERS = [
  { name: "$0–10K", volume: 0, makerFee: 0.0040, takerFee: 0.0060 },
  { name: "$10K–50K", volume: 10000, makerFee: 0.0025, takerFee: 0.0040 },
  { name: "$50K–100K", volume: 50000, makerFee: 0.0015, takerFee: 0.0025 },
  { name: "$100K–1M", volume: 100000, makerFee: 0.0010, takerFee: 0.0020 },
  { name: "$1M–15M", volume: 1000000, makerFee: 0.0008, takerFee: 0.0018 },
  { name: "$15M–75M", volume: 15000000, makerFee: 0.0006, takerFee: 0.0016 },
  { name: "$75M–250M", volume: 75000000, makerFee: 0.0003, takerFee: 0.0012 },
  { name: "$250M–400M", volume: 250000000, makerFee: 0.0000, takerFee: 0.0008 },
  { name: "$400M+", volume: 400000000, makerFee: 0.0000, takerFee: 0.0005 },
]

// Simple Mode fee structure
const SIMPLE_MODE_FEES = {
  openingFee: 0.0008, // 0.08%
  closingFee: 0.0008, // 0.08%
  highLeverageThreshold: 500, // 500x leverage
  dynamicClosingFee: {
    shareRate: 0.15, // 15% of profit
    minRate: 0.0003, // 0.03% minimum
  },
  executionFees: {
    bnb: 0.50,
    arbitrum: 0.20
  },
  liquidationLossRate: 0.90 // 90%
}

export default function AsterCalculator() {
  const [volume, setVolume] = useState([50000])
  const [tradingMode, setTradingMode] = useState("simple")
  const [timeframe, setTimeframe] = useState("yearly")
  const [showResults, setShowResults] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])
  const [displayVolume, setDisplayVolume] = useState(50000)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)
  const [userVIPTier, setUserVIPTier] = useState("VIP_1")
  const [userMMTier, setUserMMTier] = useState<string | null>(null)
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
    const expValue = Math.pow(normalized, 2.5)
    return min + (max - min) * expValue
  }, [])

  const inverseExpScale = useCallback((value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min)
    return Math.round(100 * Math.pow(normalized, 1 / 2.5))
  }, [])

  // Smart rounding based on magnitude for better UX
  const smartRound = useCallback((value: number) => {
    if (value < 10000) {
      return Math.round(value / 100) * 100
    } else if (value < 100000) {
      return Math.round(value / 1000) * 1000
    } else if (value < 1000000) {
      return Math.round(value / 10000) * 10000
    } else {
      return Math.round(value / 100000) * 100000
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
    setSliderValue(value)
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const scaledValue = expScale(value[0], 100, 100000000)
      const roundedValue = smartRound(scaledValue)
      setVolume([roundedValue])
      setDisplayVolume(roundedValue)
    }, prefersReducedMotion ? 50 : 16)
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

  // Determine VIP tier based on volume
  const determineVIPTier = useCallback((monthlyVolume: number) => {
    // VIP tiers are based on 14-day rolling volume
    // If monthly volume is X, then 14-day volume = (X * 14) / 30 = X * 0.467
    const fourteenDayVolume = monthlyVolume * (14 / 30)
    
    if (fourteenDayVolume >= VIP_TIERS.VIP_6.volume) return "VIP_6"
    if (fourteenDayVolume >= VIP_TIERS.VIP_5.volume) return "VIP_5"
    if (fourteenDayVolume >= VIP_TIERS.VIP_4.volume) return "VIP_4"
    if (fourteenDayVolume >= VIP_TIERS.VIP_3.volume) return "VIP_3"
    if (fourteenDayVolume >= VIP_TIERS.VIP_2.volume) return "VIP_2"
    return "VIP_1"
  }, [])

  // Determine Market Maker tier
  const determineMMTier = useCallback((monthlyVolume: number) => {
    // MM tiers are also based on 14-day rolling volume
    const fourteenDayVolume = monthlyVolume * (14 / 30)
    
    if (fourteenDayVolume >= MM_TIERS.MM_2.volume) return "MM_2"
    if (fourteenDayVolume >= MM_TIERS.MM_1.volume) return "MM_1"
    return null
  }, [])

  // Determine Hyperliquid tier based on volume
  const determineHyperliquidTier = useCallback((monthlyVolume: number) => {
    // Hyperliquid tiers are based on 14-day rolling volume
    const fourteenDayVolume = monthlyVolume * (14 / 30)
    
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_6.volume) return "TIER_6"
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_5.volume) return "TIER_5"
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_4.volume) return "TIER_4"
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_3.volume) return "TIER_3"
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_2.volume) return "TIER_2"
    if (fourteenDayVolume >= HYPERLIQUID_TIERS.TIER_1.volume) return "TIER_1"
    return "BASE"
  }, [])

  // Determine Binance VIP tier based on 30d volume (no BNB discount considered)
  const determineBinanceTier = useCallback((monthlyVolume: number) => {
    const thirtyDayVolume = monthlyVolume // monthly approximates 30d
    let selected = BINANCE_TIERS[0]
    for (let i = BINANCE_TIERS.length - 1; i >= 0; i--) {
      if (thirtyDayVolume >= BINANCE_TIERS[i].volume) {
        selected = BINANCE_TIERS[i]
        break
      }
    }
    return selected
  }, [])

  // Determine Bybit tier based on 30d derivatives volume
  const determineBybitTier = useCallback((monthlyVolume: number) => {
    const thirtyDayVolume = monthlyVolume
    let selected = BYBIT_TIERS[0]
    for (let i = BYBIT_TIERS.length - 1; i >= 0; i--) {
      if (thirtyDayVolume >= BYBIT_TIERS[i].volume) {
        selected = BYBIT_TIERS[i]
        break
      }
    }
    return selected
  }, [])

  // Determine Coinbase tier based on 30d USD volume
  const determineCoinbaseTier = useCallback((monthlyVolume: number) => {
    const thirtyDayVolume = monthlyVolume
    let selected = COINBASE_TIERS[0]
    for (let i = COINBASE_TIERS.length - 1; i >= 0; i--) {
      if (thirtyDayVolume >= COINBASE_TIERS[i].volume) {
        selected = COINBASE_TIERS[i]
        break
      }
    }
    return selected
  }, [])

  // Update VIP and MM tiers when volume changes
  useEffect(() => {
    const newVIPTier = determineVIPTier(volume[0])
    const newMMTier = determineMMTier(volume[0])
    setUserVIPTier(newVIPTier)
    setUserMMTier(newMMTier)
  }, [volume, determineVIPTier, determineMMTier])

  // Calculate fees for Simple Mode
  const calculateSimpleModeFees = useCallback((monthlyVolume: number) => {
    const openingFee = monthlyVolume * SIMPLE_MODE_FEES.openingFee
    const closingFee = monthlyVolume * SIMPLE_MODE_FEES.closingFee
    const executionFee = SIMPLE_MODE_FEES.executionFees.arbitrum // Assuming Arbitrum for calculation
    const totalFees = openingFee + closingFee + executionFee
    
    return {
      openingFee,
      closingFee,
      executionFee,
      totalFees,
      feeRate: (totalFees / monthlyVolume) * 100
    }
  }, [])

  // Calculate fees for Pro Mode with VIP tiers
  const calculateProModeFees = useCallback((monthlyVolume: number) => {
    const vipTier = VIP_TIERS[userVIPTier as keyof typeof VIP_TIERS]
    const mmTier = userMMTier ? MM_TIERS[userMMTier as keyof typeof MM_TIERS] : null
    
    // Apply VIP tier fees
    let makerFee = vipTier.makerFee
    let takerFee = vipTier.takerFee
    
    // Apply Market Maker rebates if applicable
    if (mmTier) {
      makerFee = Math.max(0, makerFee - mmTier.makerRebate) // Apply rebate (negative fee)
      takerFee = mmTier.takerFee // Use MM taker fee
    }
    
    const avgFeeRate = (makerFee + takerFee) / 2
    const totalFees = monthlyVolume * avgFeeRate
    
    return {
      makerFee,
      takerFee,
      totalFees,
      feeRate: avgFeeRate * 100,
      vipTier: vipTier.name,
      mmTier: mmTier?.name || null
    }
  }, [userVIPTier, userMMTier])

  // Aster official data
  const asterData = {
    volume: "480B",
    users: "1M",
    openInterest: "237M",
    tvl: "347M",
    symbols: 101
  }

  // Updated competitor data with 2025 fee structures
  const competitors = {
    gmx: {
      name: "GMX",
      fee: 0.001, // 0.04% opening + 0.04% closing = 0.08% total (improving balance)
      bridgeCost: 5,
      makerFee: 0.0004, // 0.04% opening fee
      takerFee: 0.0004, // 0.04% closing fee
      description: "Decentralized perpetual exchange on Arbitrum/Avalanche"
    },
    
    hyperliquid: {
      name: "Hyperliquid",
      fee: 0.0005, // Base rate, will be calculated dynamically
      bridgeCost: 0, // Zero gas fees on their L1
      makerFee: 0.00015, // Base maker fee 0.015%
      takerFee: 0.00045, // Base taker fee 0.045%
      description: "Layer 1 perpetual exchange with complex tier system"
    },
    binance: {
      name: "Binance",
      fee: 0.00055, // Average of maker (0.02%) and taker (0.05%)
      bridgeCost: 8,
      makerFee: 0.0002, // 0.02% maker fee
      takerFee: 0.0005, // 0.05% taker fee
      description: "World's largest centralized exchange with VIP tiers"
    },
    bybit: {
      name: "Bybit",
      fee: 0.000375, // Average of maker (0.02%) and taker (0.055%)
      bridgeCost: 6,
      makerFee: 0.0002, // 0.02% maker fee
      takerFee: 0.00055, // 0.055% taker fee
      description: "Major centralized exchange with VIP tiers"
    },
    coinbase: {
      name: "Coinbase",
      fee: 0.0002, // 0.02% all-inclusive fee
      bridgeCost: 7,
      makerFee: 0.0002, // 0.02% inclusive fee
      takerFee: 0.0002, // 0.02% inclusive fee
      description: "US-regulated centralized exchange"
    },
    apex: {
      name: "ApeX",
      fee: 0.00035, // Average of maker 0.02% and taker 0.05%
      bridgeCost: 4,
      makerFee: 0.0002, // 0.02%
      takerFee: 0.0005, // 0.05%
      description: "Decentralized order book with flat fees"
    }
  }

  // Calculate savings based on new fee structure
  const calculateSavings = () => {
    const monthlyVolume = volume[0]
    
    let asterFees: any
    
    if (tradingMode === "simple") {
      asterFees = calculateSimpleModeFees(monthlyVolume)
    } else {
      asterFees = calculateProModeFees(monthlyVolume)
    }
    
    // Desired display order
    const competitorOrder = [
      "hyperliquid",
      "apex",
      "gmx",
      "binance",
      "bybit",
      "coinbase",
    ] as const

    const savings = competitorOrder.map((key) => {
      const comp = competitors[key as keyof typeof competitors]
      let competitorFee = 0
      
      // Handle different fee structures
      if (comp.name === "GMX") {
        // GMX: 0.04% opening + 0.04% closing = 0.08% total (improving balance)
        // 0.06% opening + 0.06% closing = 0.12% total (worsening balance)
        // Assume 70% improving balance, 30% worsening balance for average user
        const improvingBalanceFee = monthlyVolume * 0.0008 // 0.08% total
        const worseningBalanceFee = monthlyVolume * 0.0012 // 0.12% total
        competitorFee = (improvingBalanceFee * 0.7) + (worseningBalanceFee * 0.3)
      } else if (comp.name === "Hyperliquid") {
        // Hyperliquid: Complex tier system based on 14-day volume
        const fourteenDayVolume = monthlyVolume * (14 / 30)
        const tier = determineHyperliquidTier(monthlyVolume)
        const tierData = HYPERLIQUID_TIERS[tier as keyof typeof HYPERLIQUID_TIERS]
        
        // Assume 50% maker/50% taker split for average user
        const makerFee = monthlyVolume * 0.5 * tierData.makerFee
        const takerFee = monthlyVolume * 0.5 * tierData.takerFee
        
        // Apply maker rebates if applicable (simplified calculation)
        let makerRebate = 0
        if (fourteenDayVolume >= 50000000) { // $50M+ volume for significant maker activity
          makerRebate = monthlyVolume * 0.5 * 0.00002 // 0.2% rebate for high volume makers
        }
        
        competitorFee = makerFee + takerFee - makerRebate
      } else if (comp.name === "ApeX") {
        // ApeX: Flat maker/taker (0.02% / 0.05%)
        const makerCost = monthlyVolume * 0.5 * comp.makerFee
        const takerCost = monthlyVolume * 0.5 * comp.takerFee
        competitorFee = makerCost + takerCost
      } else if (comp.name === "Binance") {
        // Binance: Use 30d volume based tier (no BNB discount)
        const tier = determineBinanceTier(monthlyVolume)
        // Assume 50% maker / 50% taker split
        const makerCost = monthlyVolume * 0.5 * tier.makerFee
        const takerCost = monthlyVolume * 0.5 * tier.takerFee
        competitorFee = makerCost + takerCost
      } else if (comp.name === "Bybit") {
        // Bybit: Use 30d derivatives volume based tier
        const tier = determineBybitTier(monthlyVolume)
        const makerCost = monthlyVolume * 0.5 * tier.makerFee
        const takerCost = monthlyVolume * 0.5 * tier.takerFee
        competitorFee = makerCost + takerCost
      } else if (comp.name === "Coinbase") {
        // Coinbase Exchange: 30d USD volume based maker/taker
        const tier = determineCoinbaseTier(monthlyVolume)
        const makerCost = monthlyVolume * 0.5 * tier.makerFee
        const takerCost = monthlyVolume * 0.5 * tier.takerFee
        competitorFee = makerCost + takerCost
      } else {
        // Standard fee calculation for other exchanges
        competitorFee = monthlyVolume * comp.fee
      }
      
      const bridgeCosts = comp.bridgeCost * 4 // Assume 4 bridge transactions per month
      const totalCompetitorCost = competitorFee + bridgeCosts
      const monthlySavings = totalCompetitorCost - asterFees.totalFees
      
      return {
        name: comp.name,
        monthlySavings,
        yearlySavings: monthlySavings * 12,
        lifetimeSavings: monthlySavings * 60, // 5 years
        percentage: ((monthlySavings / totalCompetitorCost) * 100)
      }
    })

    return { savings, asterFees }
  }

  const { savings, asterFees } = calculateSavings()
  const maxSavings = Math.max(...savings.map(s => s.yearlySavings))

  // Split competitors into DEX vs CEX for subtle grouping
  const DEX_SET = new Set(["Hyperliquid", "ApeX", "GMX"]) 
  const CEX_SET = new Set(["Binance", "Bybit", "Coinbase"]) 
  const dexSavings = savings.filter(s => DEX_SET.has(s.name))
  const cexSavings = savings.filter(s => CEX_SET.has(s.name))

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
    const text = `I save ${formatCurrency(bestSaving.yearlySavings)} yearly trading on @Aster_DEX! 🚀\n\nHidden orders + VIP fees + cross-chain liquidity = pure alpha 💎\n\nDecentralized perpetual contracts with $${asterData.volume} volume. The future is here! ⭐\n\nCalculate your savings:`
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    
    openExternalLink(shareUrl)
  }

  // Get current fee display info
  const getFeeDisplayInfo = () => {
    if (tradingMode === "simple") {
      return {
        mode: "Simple Mode",
        description: "One-click trading with MEV protection",
        fees: [
          `Opening Fee: 0.08%`,
          `Closing Fee: 0.08%`,
          `Execution Fee: $${SIMPLE_MODE_FEES.executionFees.arbitrum}`,
          `High Leverage: Dynamic fees`
        ]
      }
    } else {
      const vipTier = VIP_TIERS[userVIPTier as keyof typeof VIP_TIERS]
      const mmTier = userMMTier ? MM_TIERS[userMMTier as keyof typeof MM_TIERS] : null
      
      return {
        mode: "Pro Mode",
        description: "Order book trading with VIP tiers",
        fees: [
          `Maker Fee: ${(vipTier.makerFee * 100).toFixed(3)}%`,
          `Taker Fee: ${(vipTier.takerFee * 100).toFixed(3)}%`,
          `VIP Tier: ${vipTier.name}`,
          mmTier ? `MM Rebate: ${(mmTier.makerRebate * 100).toFixed(3)}%` : null
        ].filter(Boolean)
      }
    }
  }

  const feeDisplayInfo = getFeeDisplayInfo()

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
              <Card className="glass-effect allow-overflow" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
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
                    <label className="text-white font-semibold text-sm block">Trading Mode</label>
                    <Tabs value={tradingMode} onValueChange={setTradingMode}>
                      <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-white/20 h-8">
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

                {/* VIP Tier Display */}
                {tradingMode === "pro" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-semibold text-sm block">Your VIP Tier</label>
                      <div className="flex items-center gap-1">
                        <Crown className="w-4 h-4 text-[#efbf84]" />
                        <span className="text-[#efbf84] font-semibold text-sm">
                          {VIP_TIERS[userVIPTier as keyof typeof VIP_TIERS].name}
                        </span>
                      </div>
                    </div>
                    {userMMTier && (
                      <div className="flex items-center justify-between">
                        <label className="text-white font-semibold text-sm block">Market Maker</label>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-[#efbf84]" />
                          <span className="text-[#efbf84] font-semibold text-sm">
                            {MM_TIERS[userMMTier as keyof typeof MM_TIERS].name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={() => {
                    setShowResults(true);
                    if (window.innerWidth < 1024) {
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
                  <CardTitle className="text-white text-sm">{feeDisplayInfo.mode}</CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[#efbf84] text-xs">
                      {tradingMode === "simple" ? "0.08% opening" : 
                       `${(asterFees?.makerFee * 100).toFixed(3)}% maker`}
                    </p>
                    <div className="group relative">
                      <Info className="w-3 h-3 text-[#efbf84] cursor-help hover:text-white transition-colors" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-[200px]">
                        <div className="text-white text-xs font-semibold mb-1">{feeDisplayInfo.mode}</div>
                        <div className="text-[#efbf84] text-xs space-y-1">
                          {feeDisplayInfo.fees.map((fee, index) => (
                            <div key={index}>{fee}</div>
                          ))}
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
                     "VIP Benefits"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1">
                  <p className="text-[#efbf84] text-xs">
                    {tradingMode === "simple" ? "Built-in protection" : 
                     "Volume-based discounts"}
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
              <Card className="glass-effect allow-overflow" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-[#efbf84]" />
                    Your Savings
                  </CardTitle>
                  <p className="text-[#efbf84] text-xs">vs other platforms</p>
                </CardHeader>
                <CardContent className="pt-2 space-y-2">
                  {/* DEX group header */}
                  <div className="text-[10px] uppercase tracking-wide text-[#efbf84]/70 pl-1 pt-1">Decentralized Exchanges</div>
                  {dexSavings.map((saving, index) => {
                    const timeframeSaving = saving[`${timeframe}Savings` as keyof typeof saving] as number
                    const progressValue = Math.min(Math.max(saving.percentage, 5), 100)
                    
                    const competitorKey = Object.keys(competitors).find(key => 
                      competitors[key as keyof typeof competitors].name === saving.name
                    )
                    const competitor = competitorKey ? competitors[competitorKey as keyof typeof competitors] : null
                    
                    return (
                      <div key={`dex-${index}`} className="bg-black/30 rounded-md p-2 border border-[#efbf84]/20">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-xs">vs {saving.name}</span>
                              {competitor && (
                                <div className="group relative overflow-visible">
                                <Info className="w-3 h-3 text-[#efbf84] cursor-help hover:text-white transition-colors" />
                                                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-[220px]">
                                   <div className="text-white text-xs font-semibold mb-1">{competitor.description}</div>
                                                                       <div className="text-[#efbf84] text-xs space-y-1">
                                      {competitor.name === "GMX" ? (
                                        <>
                                          <div>Open: 0.04%–0.06%</div>
                                          <div>Close: 0.04%–0.06%</div>
                                          <div>Est. round trip: ~0.092%</div>
                                        </>
                                      ) : competitor.name === "Hyperliquid" ? (
                                        <>
                                          <div>Tier: {determineHyperliquidTier(volume[0]).replace('_', ' ')}</div>
                                          <div>Taker Fee: {(HYPERLIQUID_TIERS[determineHyperliquidTier(volume[0]) as keyof typeof HYPERLIQUID_TIERS].takerFee * 100).toFixed(3)}%</div>
                                          <div>Maker Fee: {(HYPERLIQUID_TIERS[determineHyperliquidTier(volume[0]) as keyof typeof HYPERLIQUID_TIERS].makerFee * 100).toFixed(3)}%</div>
                                          <div>14d Volume: ${formatCurrency(volume[0] * (14 / 30))}</div>
                                          <div>Gas: $0 (L1 chain)</div>
                                        </>
                                      ) : competitor.name === "ApeX" ? (
                                        <>
                                          <div>Maker Fee: 0.020%</div>
                                          <div>Taker Fee: 0.050%</div>
                                        </>
                                      ) : competitor.name === "Binance" ? (
                                        <>
                                          {(() => {
                                            const t = determineBinanceTier(volume[0])
                                            return (
                                              <>
                                                <div>Tier: {t.name}</div>
                                                <div>Maker Fee: {(t.makerFee * 100).toFixed(3)}%</div>
                                                <div>Taker Fee: {(t.takerFee * 100).toFixed(3)}%</div>
                                                <div>30d Volume: {formatCurrency(volume[0])}</div>
                                              </>
                                            )
                                          })()}
                                        </>
                                      ) : competitor.name === "Bybit" ? (
                                        <>
                                          {(() => {
                                            const t = determineBybitTier(volume[0])
                                            return (
                                              <>
                                                <div>Tier: {t.name}</div>
                                                <div>Maker Fee: {(t.makerFee * 100).toFixed(3)}%</div>
                                                <div>Taker Fee: {(t.takerFee * 100).toFixed(3)}%</div>
                                                <div>30d Volume: {formatCurrency(volume[0])}</div>
                                              </>
                                            )
                                          })()}
                                        </>
                                      ) : competitor.name === "Coinbase" ? (
                                        <>
                                          {(() => {
                                            const t = determineCoinbaseTier(volume[0])
                                            return (
                                              <>
                                                <div>Tier: {t.name}</div>
                                                <div>Maker Fee: {(t.makerFee * 100).toFixed(2)}%</div>
                                                <div>Taker Fee: {(t.takerFee * 100).toFixed(2)}%</div>
                                                <div>30d Volume: {formatCurrency(volume[0])}</div>
                                              </>
                                            )
                                          })()}
                                        </>
                                      ) : competitor.name === "ApeX" ? (
                                        <>
                                          <div>Maker Fee: 0.020%</div>
                                          <div>Taker Fee: 0.050%</div>
                                          <div>Tiered program: Planned</div>
                                        </>
                                      ) : (
                                       <>
                                         <div>Maker Fee: {(competitor.makerFee * 100).toFixed(3)}%</div>
                                         <div>Taker Fee: {(competitor.takerFee * 100).toFixed(3)}%</div>
                                         <div>Bridge Cost: ${competitor.bridgeCost}</div>
                                       </>
                                     )}
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

                  {/* CEX group header */}
                  <div className="text-[10px] uppercase tracking-wide text-white/60 pl-1 pt-3">Centralized Exchanges</div>
                  {cexSavings.map((saving, index) => {
                    const timeframeSaving = saving[`${timeframe}Savings` as keyof typeof saving] as number
                    const progressValue = Math.min(Math.max(saving.percentage, 5), 100)
                    const competitorKey = Object.keys(competitors).find(key => 
                      competitors[key as keyof typeof competitors].name === saving.name
                    )
                    const competitor = competitorKey ? competitors[competitorKey as keyof typeof competitors] : null
                    return (
                      <div key={`cex-${index}`} className="bg-black/30 rounded-md p-2 border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-xs">vs {saving.name}</span>
                            {competitor && (
                              <div className="group relative overflow-visible">
                                <Info className="w-3 h-3 text-[#efbf84] cursor-help hover:text-white transition-colors" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-[220px]">
                                  <div className="text-white text-xs font-semibold mb-1">{competitor.description}</div>
                                  <div className="text-[#efbf84] text-xs space-y-1">
                                    {competitor.name === "Binance" ? (
                                      <>
                                        {(() => {
                                          const t = determineBinanceTier(volume[0])
                                          return (
                                            <>
                                              <div>Tier: {t.name}</div>
                                              <div>Maker Fee: {(t.makerFee * 100).toFixed(3)}%</div>
                                              <div>Taker Fee: {(t.takerFee * 100).toFixed(3)}%</div>
                                              <div>30d Volume: {formatCurrency(volume[0])}</div>
                                            </>
                                          )
                                        })()}
                                      </>
                                    ) : competitor.name === "Bybit" ? (
                                      <>
                                        {(() => {
                                          const t = determineBybitTier(volume[0])
                                          return (
                                            <>
                                              <div>Tier: {t.name}</div>
                                              <div>Maker Fee: {(t.makerFee * 100).toFixed(3)}%</div>
                                              <div>Taker Fee: {(t.takerFee * 100).toFixed(3)}%</div>
                                              <div>30d Volume: {formatCurrency(volume[0])}</div>
                                            </>
                                          )
                                        })()}
                                      </>
                                    ) : competitor.name === "Coinbase" ? (
                                      <>
                                        {(() => {
                                          const t = determineCoinbaseTier(volume[0])
                                          return (
                                            <>
                                              <div>Tier: {t.name}</div>
                                              <div>Maker Fee: {(t.makerFee * 100).toFixed(2)}%</div>
                                              <div>Taker Fee: {(t.takerFee * 100).toFixed(2)}%</div>
                                              <div>30d Volume: {formatCurrency(volume[0])}</div>
                                            </>
                                          )
                                        })()}
                                      </>
                                    ) : (
                                      <>
                                        <div>Maker Fee: {(competitor.makerFee * 100).toFixed(3)}%</div>
                                        <div>Taker Fee: {(competitor.takerFee * 100).toFixed(3)}%</div>
                                        <div>Bridge Cost: ${competitor.bridgeCost}</div>
                                      </>
                                    )}
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
