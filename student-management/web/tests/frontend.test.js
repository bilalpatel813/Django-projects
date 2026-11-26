import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, weeklyDelta, StatCard, DonutChart, StudentForm

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  ;({ weeklyDelta } = await server.ssrLoadModule('/src/utils/format.js'))
  ;({ default: StatCard } = await server.ssrLoadModule('/src/components/dashboard/StatCard.jsx'))
  ;({ default: DonutChart } = await server.ssrLoadModule('/src/components/dashboard/DonutChart.jsx'))
  ;({ default: StudentForm } = await server.ssrLoadModule('/src/components/students/StudentForm.jsx'))
})

after(async () => { await server?.close() })

test('weekly change does not invent a percentage from a zero baseline', () => {
  assert.equal(weeklyDelta({ students_this_week: 3, students_previous_week: 0 }), undefined)
  assert.equal(weeklyDelta({ students_this_week: 0, students_previous_week: 0 }), 0)
  assert.equal(weeklyDelta({ students_this_week: 2, students_previous_week: 4 }), -50)
  assert.equal(weeklyDelta({ students_this_week: 6, students_previous_week: 4 }), 50)
})

test('metric changes retain their sign in accessible text', () => {
  const markup = renderToStaticMarkup(React.createElement(StatCard, { label: 'Students', value: 2, delta: -50 }))
  assert.match(markup, /-50%/)
})

test('course chart can label the subtotal accurately', () => {
  const markup = renderToStaticMarkup(React.createElement(DonutChart, {
    data: [{ course: 'Math', total: 3 }], unitLabel: 'in top courses',
  }))
  assert.match(markup, /in top courses/)
  assert.match(markup, /Math/)
})

test('student form shows errors for fields it does not recognize', () => {
  const markup = renderToStaticMarkup(React.createElement(StudentForm, {
    serverErrors: { first_name: ['Required'], unexpected_field: ['Invalid value'] },
  }))
  assert.match(markup, /unexpected_field: Invalid value/)
  assert.match(markup, /aria-describedby="error-first_name"/)
})
