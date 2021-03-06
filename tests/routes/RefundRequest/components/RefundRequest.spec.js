import React from 'react'
import RefundRequest from 'routes/RefundRequest/components/RefundRequest'
import sinon from 'sinon';
import {mount, shallow} from 'enzyme';

const props = {
  systemErrorData: {
    sysErrReports: [],
    isShowSystemError:   false
  },
  pdfData:               {
    pdf: {
      isError:   false,
      isLoading: false,
      file:      null,
      content:   null,
      page:      0,
      scale:     1.0
    }
  },
  lookupFormData:        {
    lookupForm: {
      isIssue:      false,
      issueReport:  [],
      isLookingUp:  false,
      referenceNum: 'Yow',
      dateFrom:     null,
      dateTo:       null,
      email:        null
    }
  },
  refundRequestFormData: {
    refundRequestForm: {
      isIssue:                 false,
      issueReport:             [],
      fees:                    {
        isIssue: false,
        data:    null,
      },
      depositAccountNum:       0,
      reason:                  null,
      rationale:               null,
      names:                   {
        isIssue: false,
        data:    null
      },
      name:                    {
        found: false,
        name:  null
      },
      addresses:               {
        isIssue: false,
        data:    null
      },
      address:                 {
        found:   false,
        address: null
      },
      phone:                   null,
      isLoadingNames:          false,
      isLoadingPaymentHistory: false,
      attorneyDocketNum:       0,
      acknowledgement:         false,
      requestDate:             null
    }
  },
  miscData: {
    misc: {
      isIssue:               false,
      isResettingRefundForm: false,
      isNegativeTesting:     false,
      issueReport:           []
    }
  },
  save:                  {
    isIssue:             false,
    isSaving:            false,
    isSaved:             false,
  },
  isIssue:               false,
  isResettingRefundForm: false,
  isNegativeTesting:     false,
  issueReport:           [],
  systemError:           sinon.spy(),
  goToLogin:             sinon.spy(),
  loadingPdf:            sinon.spy(),
  lookupReferencedData:  sinon.spy(),
  pdfBinary:             sinon.spy(),
  pdfLoaded:             sinon.spy(),
  resetState:            sinon.spy(),
  saveRefundRequest:     sinon.spy(),
  validLookup:           sinon.spy()
}

describe('(Route/Component) RefundRequest/RefundRequest', () => {
  it('should exist', () => {
    expect(RefundRequest).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(RefundRequest.prototype, 'componentDidMount');
    const wrapper = shallow(<RefundRequest {...props} />)
    //expect(RefundRequest.prototype.componentDidMount.calledOnce).to.be.true

    //let pdfPanel = wrapper.props().children[0]
    //console.log("PdfPanel Props: " + JSON.stringify(pdfPanel.props))
    //let lookupPanel = wrapper.props().children[1]
    //console.log("LookupPanel Props: " + JSON.stringify(lookupPanel.props))
    //
    //expect(pdfPanel.props.isLoading).to.be.false
    //// wrapper.setProps({ refundRequest: { refundRequest:  { id: 0, value: 'Yowsa' }  });
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
  //   const wrapper = shallow(<RefundRequest {...props} />)
  //   wrapper.find('.wisdom').simulate('click')
  //   expect(initialProps.fetchZen.calledOnce).to.be.true
  // })
  //
  // it('Simulate save', () => {
  //   const wrapper = shallow(<RefundRequest {...props} />)
  //   wrapper.find('.save').simulate('click')
  //   expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  // })
  //
  // it('List populated', () => {
  //   const wrapper = shallow(<RefundRequest {...props} />)
  //   wrapper.find('li').forEach(function (node) {
  //     expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
  //   })
  // })
})
