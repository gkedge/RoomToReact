import React from 'react'
import LoadRefundRequest from 'routes/LoadRefundRequest/components/LoadRefundRequest'
import sinon from 'sinon';
import {mount, shallow} from 'enzyme';

const props = {
  pdfData:                {
    pdf: {
      isLoading: false,
      file:      null,
      content:   null,
      page:      0,
      scale:     1.0
    }
  },
  lookupFormData:         {
    referenceNum: 'Yow',
    dateFrom:     null,
    dateTo:       null,
    email:        null
  },
  saveRefundRequestData:  {
    isSaving: false,
    isSaved:  false
  },
  fetchRefundRequestFile: sinon.spy(),
  loadingPdf:             sinon.spy(),
  pdfBinary:              sinon.spy(),
  pdfLoaded:              sinon.spy(),
  resetState:             sinon.spy(),
  saveRefundRequest:      sinon.spy(),
  validLookup:            sinon.spy()
}

describe('(Route/Component) LoadRefundRequest/LoadRefundRequest', () => {
  it('should exist', () => {
    expect(LoadRefundRequest).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(LoadRefundRequest.prototype, 'componentDidMount');
    const wrapper = shallow(<LoadRefundRequest {...props} />)
    //expect(LoadRefundRequest.prototype.componentDidMount.calledOnce).to.be.true

    //let pdfPanel = wrapper.props().children[0]
    //console.log("PdfPanel Props: " + JSON.stringify(pdfPanel.props))
    //let lookupPanel = wrapper.props().children[1]
    //console.log("LookupPanel Props: " + JSON.stringify(lookupPanel.props))
    //
    //expect(pdfPanel.props.isLoading).to.be.false
    //// wrapper.setProps({ loadRefundRequest: { loadRefundRequest:  { id: 0, value: 'Yowsa' }  });
    //expect(pdfPanel.props.file).to.be.null
    //expect(pdfPanel.props.content).to.be.null
    //
    //expect(lookupPanel.props.referenceNum).to.equal('Yow')

    const propsChange = {
      "children": [
        {
          "props": {
            "pdf": {
              "file": 'Yumsa'
            }
          }
        },
        {
          "props": {
            "referenceNum": "Yowsa"
          }
        }
      ]
    }

    wrapper.setProps(propsChange);
    //pdfPanel = wrapper.props().children[0]
    //console.log("Pdf Props: " + JSON.stringify(pdfPanel.props))
    //expect(pdfPanel.props.file).to.equal('Yumsa')
    //lookupPanel = wrapper.props().children[1];
    //console.log("LookupPanel Props: " + JSON.stringify(lookupPanel.props))
    //expect(lookupPanel.props.referenceNum).to.equal('Yowsa')
  })

  // it('Simulate wisdom', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('.wisdom').simulate('click')
  //   expect(initialProps.fetchZen.calledOnce).to.be.true
  // })
  //
  // it('Simulate save', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('.save').simulate('click')
  //   expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  // })
  //
  // it('List populated', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('li').forEach(function (node) {
  //     expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
  //   })
  // })
})
