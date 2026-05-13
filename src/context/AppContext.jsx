import { createContext, useContext, useReducer, useCallback } from 'react'

// ─── Initial state ───────────────────────────────────────────────────────────
const initialState = {
  // Navigation
  view: 'intro',                // 'intro' | 'onboarding' | 'dashboard' | 'storefront'
  dashboardTab: 'home',        // 'home' | 'orders' | 'customers' | 'analytics'

  // Onboarding
  onboardingStep: 1,           // 1–5
  onboardingComplete: false,

  // Profile
  profile: {
    name: '',
    businessName: '',
    businessType: null,        // BUSINESS_TYPES[i]
    isPerishable: null,        // true | false
    deliveryType: null,        // 'self' | 'partner' | 'both'
    deliveryPartner: null,     // DELIVERY_PARTNERS[i]
    payLaterEnabled: true,
    paymentMethods: [],
    customBusinessType: '',
    phone: '',
  },

  // WhatsApp catalog (simulated sync)
  catalog: [],
  catalogSynced: false,

  // Daily Drop
  todaysDrop: {
    isActive: false,
    items: [],                 // { id, name, todayPrice, todayQty, remaining, image, adHoc }
    publishedAt: null,
    smartLink: '',
  },

  // Subscriptions (recurring orders from storefront)
  subscriptions: [],
  // Each subscription: { id, itemId, itemName, itemPrice, itemImage, itemUnit,
  //   itemDescription, qty, frequency, intervalDays, weekdays,
  //   nextDeliveryAt, createdAt }
  // frequency: 'daily' | 'every_n_days' | 'specific_days'

  // Orders
  orders: [],
  // Each order: { id, customerName, customerPhone, customerAddress,
  //   items[], subtotal, deliveryFee, total, paymentMode, status, placedAt }
  // status: 'new' | 'preparing' | 'instock' | 'fulfillment' | 'delivered'

  // Orders filter (set when clicking a bucket tile)
  ordersFilter: null,          // null = show all, or a status string like 'new', 'preparing', etc.

  // UI flags
  showDailyDropModal: false,
  showMarketingCard: false,
  showDashboardFTU: true,
  storefrontOrderId: null,     // last placed order id, for confirmation screen
}

// ─── Action types ─────────────────────────────────────────────────────────────
export const A = {
  // Onboarding
  SET_PROFILE_FIELD: 'SET_PROFILE_FIELD',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  SET_CATALOG: 'SET_CATALOG',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',

  // Navigation
  SET_VIEW: 'SET_VIEW',
  SET_DASHBOARD_TAB: 'SET_DASHBOARD_TAB',

  // Daily Drop
  OPEN_DAILY_DROP: 'OPEN_DAILY_DROP',
  CLOSE_DAILY_DROP: 'CLOSE_DAILY_DROP',
  PUBLISH_DAILY_DROP: 'PUBLISH_DAILY_DROP',
  UPDATE_DROP_ITEM: 'UPDATE_DROP_ITEM',
  CLOSE_MARKETING_CARD: 'CLOSE_MARKETING_CARD',
  DISMISS_DASHBOARD_FTU: 'DISMISS_DASHBOARD_FTU',

  // Subscriptions
  ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION',
  REMOVE_SUBSCRIPTION: 'REMOVE_SUBSCRIPTION',

  // Orders
  PLACE_ORDER: 'PLACE_ORDER',
  ADVANCE_ORDER_STATUS: 'ADVANCE_ORDER_STATUS',
  DECREMENT_STOCK: 'DECREMENT_STOCK',
  SET_ORDERS_FILTER: 'SET_ORDERS_FILTER',
}

// ─── Status progression ───────────────────────────────────────────────────────
const STATUS_FLOW = {
  new:         (perishable) => perishable ? 'preparing' : 'instock',
  preparing:   () => 'fulfillment',
  instock:     () => 'fulfillment',
  fulfillment: () => 'delivered',
  delivered:   () => 'delivered',
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, { type, payload }) {
  switch (type) {

    case A.SET_PROFILE_FIELD:
      return { ...state, profile: { ...state.profile, [payload.field]: payload.value } }

    case A.NEXT_STEP:
      return { ...state, onboardingStep: Math.min(state.onboardingStep + 1, 5) }

    case A.PREV_STEP:
      return { ...state, onboardingStep: Math.max(state.onboardingStep - 1, 1) }

    case A.SET_CATALOG:
      return { ...state, catalog: payload, catalogSynced: true }

    case A.COMPLETE_ONBOARDING:
      return { ...state, onboardingComplete: true, view: 'dashboard' }

    case A.SET_VIEW:
      return { ...state, view: payload }

    case A.SET_DASHBOARD_TAB:
      return { ...state, dashboardTab: payload, ordersFilter: payload === 'orders' ? state.ordersFilter : null }

    case A.SET_ORDERS_FILTER:
      return { ...state, ordersFilter: payload }

    case A.OPEN_DAILY_DROP:
      return { ...state, showDailyDropModal: true }

    case A.CLOSE_DAILY_DROP:
      return { ...state, showDailyDropModal: false }

    case A.PUBLISH_DAILY_DROP: {
      const link = `wabiz.app/s/${state.profile.businessName
        .toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`

      const MOCK_NAMES = [
        'Ananya Sharma', 'Rajesh Kumar', 'Priya Patel', 'Vikram Singh', 'Meera Reddy',
        'Arjun Nair', 'Sneha Gupta', 'Karthik Iyer', 'Divya Menon', 'Rohit Joshi',
        'Lakshmi Rao', 'Aditya Verma', 'Pooja Desai', 'Suresh Pillai', 'Neha Bhat',
        'Amit Choudhary', 'Kavitha Rajan', 'Sanjay Mishra', 'Ritu Agarwal', 'Deepak Hegde',
      ]
      // status + paymentMode pairs that match bucket logic exactly:
      // - 'delivered' + 'later' → Pay Pending bucket
      // - 'completed' + 'now'  → Fully Complete bucket
      // - all other statuses   → their own bucket regardless of paymentMode
      const MOCK_ORDERS_CONFIG = [
        { status: 'new',              pay: 'now'   },
        { status: 'new',              pay: 'later' },
        { status: 'new',              pay: 'now'   },
        { status: 'new',              pay: 'later' },
        { status: 'new',              pay: 'now'   },
        { status: 'preparing',        pay: 'now'   },
        { status: 'preparing',        pay: 'later' },
        { status: 'preparing',        pay: 'now'   },
        { status: 'preparing',        pay: 'later' },
        { status: 'ready',            pay: 'now'   },
        { status: 'ready',            pay: 'later' },
        { status: 'ready',            pay: 'now'   },
        { status: 'out_for_delivery', pay: 'now'   },
        { status: 'out_for_delivery', pay: 'later' },
        { status: 'out_for_delivery', pay: 'now'   },
        { status: 'delivered',        pay: 'later' },
        { status: 'delivered',        pay: 'later' },
        { status: 'delivered',        pay: 'later' },
        { status: 'completed',        pay: 'now'   },
        { status: 'completed',        pay: 'now'   },
      ]
      const now = Date.now()
      const mockOrders = MOCK_NAMES.map((name, i) => {
        const cfg = MOCK_ORDERS_CONFIG[i]
        const numItems = 1 + (i % 3)
        const orderItems = payload.slice(0, numItems).map(item => ({
          id: item.id,
          name: item.name,
          todayPrice: item.todayPrice,
          qty: 1 + (i % 2),
        }))
        const total = orderItems.reduce((s, it) => s + it.todayPrice * it.qty, 0)
        return {
          id: `ORD-${now - i * 60000}`,
          customerName: name,
          customerPhone: `+91 98${String(i).padStart(3, '0')}${String(55000 + i * 111).slice(0, 5)}`,
          customerAddress: '',
          items: orderItems,
          subtotal: total,
          deliveryFee: 0,
          total,
          paymentMode: cfg.pay,
          status: cfg.status,
          placedAt: new Date(now - i * 180000).toISOString(),
        }
      })

      return {
        ...state,
        showDailyDropModal: false,
        showMarketingCard: true,
        orders: [...mockOrders, ...state.orders],
        todaysDrop: {
          isActive: true,
          items: payload,
          publishedAt: new Date().toISOString(),
          smartLink: link,
        },
      }
    }

    case A.UPDATE_DROP_ITEM: {
      const items = state.todaysDrop.items.map(i =>
        i.id === payload.id ? { ...i, ...payload.changes } : i
      )
      return { ...state, todaysDrop: { ...state.todaysDrop, items } }
    }

    case A.CLOSE_MARKETING_CARD:
      return { ...state, showMarketingCard: false }

    case A.DISMISS_DASHBOARD_FTU:
      return { ...state, showDashboardFTU: false }

    case A.ADD_SUBSCRIPTION: {
      const sub = {
        ...payload,
        id: `SUB-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      return { ...state, subscriptions: [sub, ...state.subscriptions] }
    }

    case A.UPDATE_SUBSCRIPTION: {
      const subs = state.subscriptions.map(s =>
        s.id === payload.id ? { ...s, ...payload.changes } : s
      )
      return { ...state, subscriptions: subs }
    }

    case A.REMOVE_SUBSCRIPTION:
      return { ...state, subscriptions: state.subscriptions.filter(s => s.id !== payload) }

    case A.PLACE_ORDER: {
      const order = { ...payload, id: `ORD-${Date.now()}`, placedAt: new Date().toISOString() }
      // Decrement remaining qty in todaysDrop
      const updatedItems = state.todaysDrop.items.map(dropItem => {
        const ordered = payload.items.find(i => i.id === dropItem.id)
        if (!ordered) return dropItem
        return { ...dropItem, remaining: Math.max(0, (dropItem.remaining ?? dropItem.todayQty) - ordered.qty) }
      })
      return {
        ...state,
        orders: [order, ...state.orders],
        todaysDrop: { ...state.todaysDrop, items: updatedItems },
        storefrontOrderId: order.id,
      }
    }

    case A.ADVANCE_ORDER_STATUS: {
      const orders = state.orders.map(o => {
        if (o.id !== payload) return o
        const next = STATUS_FLOW[o.status]?.(state.profile.isPerishable) ?? o.status
        return { ...o, status: next }
      })
      return { ...state, orders }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setProfileField = useCallback((field, value) =>
    dispatch({ type: A.SET_PROFILE_FIELD, payload: { field, value } }), [])

  const advanceOrder = useCallback((orderId) =>
    dispatch({ type: A.ADVANCE_ORDER_STATUS, payload: orderId }), [])

  return (
    <AppContext.Provider value={{ state, dispatch, setProfileField, advanceOrder }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
