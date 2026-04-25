/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadAppState, saveAppState } from '../utils/storage'
import { newId } from '../utils/id'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadAppState())

  useEffect(() => {
    saveAppState(state)
  }, [state])

  const actions = useMemo(() => {
    function selectGroup(groupId) {
      setState((prev) => ({ ...prev, selectedGroupId: groupId }))
    }

    function createGroup(name) {
      const trimmed = String(name ?? '').trim()
      if (!trimmed) return

      const group = {
        id: newId('grp'),
        name: trimmed,
        targetAmount: null,
        members: [],
        transactions: [],
      }

      setState((prev) => ({
        ...prev,
        selectedGroupId: group.id,
        groups: [group, ...(prev.groups ?? [])],
      }))
    }

    function addMember(groupId, name) {
      const trimmed = String(name ?? '').trim()
      if (!trimmed) return

      setState((prev) => {
        const groups = prev.groups.map((g) => {
          if (g.id !== groupId) return g
          return {
            ...g,
            members: [...g.members, { id: newId('mem'), name: trimmed }],
          }
        })
        return { ...prev, groups }
      })
    }

    function setGroupTarget(groupId, targetAmountInput) {
      setState((prev) => {
        const targetNumber = Number(targetAmountInput)
        const targetAmount = Number.isFinite(targetNumber) && targetNumber > 0 ? targetNumber : null

        const groups = prev.groups.map((g) => {
          if (g.id !== groupId) return g
          return { ...g, targetAmount }
        })
        return { ...prev, groups }
      })
    }

    function addTransaction(groupId, txInput) {
      setState((prev) => {
        const groups = prev.groups.map((g) => {
          if (g.id !== groupId) return g

          const amount = Number(txInput.amount)
          if (!Number.isFinite(amount) || amount <= 0) return g

          const paidByMemberId = txInput.paidByMemberId
          if (!paidByMemberId) return g

          const memberIds = (g.members ?? []).map((m) => m.id).filter(Boolean)
          const participantMemberIds = Array.isArray(txInput.participantMemberIds)
            ? txInput.participantMemberIds
            : memberIds
          if (participantMemberIds.length === 0) return g

          const dueDateISO = String(txInput.dueDateISO ?? txInput.dateISO ?? '').slice(0, 10)
          const paidDateISO = String(txInput.paidDateISO ?? '').slice(0, 10)
          const isSettled = txInput.isSettled === true

          const tx = {
            id: newId('tx'),
            paidByMemberId,
            amount,
            note: String(txInput.note ?? '').trim(),
            dateISO: String(txInput.dateISO ?? '').slice(0, 10),
            dueDateISO,
            paidDateISO: isSettled ? paidDateISO : '',
            participantMemberIds,
            isSettled,
          }

          return {
            ...g,
            transactions: [tx, ...g.transactions],
          }
        })

        return { ...prev, groups }
      })
    }

    function updateTransaction(groupId, txId, patch) {
      setState((prev) => {
        const groups = prev.groups.map((g) => {
          if (g.id !== groupId) return g

          return {
            ...g,
            transactions: g.transactions.map((tx) => {
              if (tx.id !== txId) return tx

              const next = {
                ...tx,
                ...patch,
              }

              if (patch.amount !== undefined) {
                const amount = Number(patch.amount)
                next.amount = Number.isFinite(amount) ? amount : tx.amount
              }

              if (patch.note !== undefined) next.note = String(patch.note ?? '').trim()
              if (patch.dateISO !== undefined)
                next.dateISO = String(patch.dateISO ?? '').slice(0, 10)

              if (patch.dueDateISO !== undefined)
                next.dueDateISO = String(patch.dueDateISO ?? '').slice(0, 10)

              if (patch.paidDateISO !== undefined)
                next.paidDateISO = String(patch.paidDateISO ?? '').slice(0, 10)

              if (patch.participantMemberIds !== undefined) {
                next.participantMemberIds = Array.isArray(patch.participantMemberIds)
                  ? patch.participantMemberIds
                  : tx.participantMemberIds
              }

              if (patch.paidByMemberId !== undefined)
                next.paidByMemberId = patch.paidByMemberId

              if (patch.isSettled !== undefined) next.isSettled = patch.isSettled === true

              if (!next.isSettled) next.paidDateISO = ''

              return next
            }),
          }
        })

        return { ...prev, groups }
      })
    }

    function deleteTransaction(groupId, txId) {
      setState((prev) => {
        const groups = prev.groups.map((g) => {
          if (g.id !== groupId) return g
          return {
            ...g,
            transactions: g.transactions.filter((tx) => tx.id !== txId),
          }
        })
        return { ...prev, groups }
      })
    }

    return {
      selectGroup,
      createGroup,
      addMember,
      setGroupTarget,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }
  }, [])

  const selectedGroup = useMemo(() => {
    const groups = state.groups ?? []
    return groups.find((g) => g.id === state.selectedGroupId) ?? groups[0] ?? null
  }, [state.groups, state.selectedGroupId])

  const value = useMemo(
    () => ({
      state,
      selectedGroup,
      actions,
    }),
    [state, selectedGroup, actions],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider />')
  return ctx
}
