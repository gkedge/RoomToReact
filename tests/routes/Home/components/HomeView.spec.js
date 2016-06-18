import React from 'react'
import { HomeView } from 'routes/Home/components/HomeView'
import { render } from 'enzyme'

describe('(View) Home', () => {
  let _component

  beforeEach(() => {
    _component = render(<HomeView />)
  })

  it('Renders a welcome message', () => {
    const welcome = _component.find('h4')
    expect(welcome).to.exist
    expect(welcome.text()).to.match(/Welcome!/)
  })

  it('Renders an awesome USPTO seal', () => {
    const usptoSeal = _component.find('img')
    expect(usptoSeal).to.exist
    expect(usptoSeal.attr('alt')).to.match(/United States Patent and Trademark Office Seal/)
  })

})
