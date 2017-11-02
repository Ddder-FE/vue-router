/* @flow */

import { createRoute, isSameRoute, isIncludedRoute } from '../util/route'

// work around weird flow bug
const toTypes: Array<Function> = [String, Object]
const eventTypes: Array<Function> = [String, Array]

export default {
  name: 'RouterLink',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'div'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    inActiveClass: [String, Number],
    activeClass: [String, Number],
    exactActiveClass: [String, Number],
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h: Function) {
    const router = this.$router
    const current = this.$route
    const { location, route } = router.resolve(this.to, current, this.append)

    const classes = {}
    const globalActiveClass = router.options.linkActiveClass
    const globalInActiveClass = router.options.linkInActiveClass
    const globalExactActiveClass = router.options.linkExactActiveClass

    // Support global empty active class
    const activeClassFallback = globalActiveClass == null
            ? 'router-link-active'
            : globalActiveClass
    const inActiveClassFallback = globalInActiveClass == null
            ? 'router-link-in-active'
            : globalInActiveClass
    const exactActiveClassFallback = globalExactActiveClass == null
            ? 'router-link-exact-active'
            : globalExactActiveClass
    const activeClass = this.activeClass == null
            ? activeClassFallback
            : this.activeClass
    const inActiveClass = this.inActiveClass == null
            ? inActiveClassFallback
            : this.inActiveClass
    const exactActiveClass = this.exactActiveClass == null
            ? exactActiveClassFallback
            : this.exactActiveClass
    const compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route

    classes[exactActiveClass] = isSameRoute(current, compareTarget)

    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget)

    classes[inActiveClass] = !classes[activeClass]

    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location)
        } else {
          router.push(location)
        }
      }
    }

    const on = { click: guardEvent }
    if (Array.isArray(this.event)) {
      this.event.forEach(e => { on[e] = handler })
    } else {
      on[this.event] = handler
    }

    const data: any = {
      class: classes,
      on: on
    }

    let $el = this.$slots.default

    if (this.$slots.active) {
      $el = classes[activeClass] ? this.$slots.active : this.$slots.default
    }
    return h(this.tag, data, $el)
  }
}

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault()
  }
  return true
}
