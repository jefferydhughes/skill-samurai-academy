import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/checkout/CartContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  ChevronDown,
  Plus,
  X,
  ShoppingCart
} from 'lucide-react';

const UPSELL_PRICES = {
  early_dropoff: 4900, // $49
  late_pickup: 4900,
  lunch_program: 7500,
  tshirt: 2500,
  private_lessons: 5000 // per hour
};

export default function CampEventModal({ event, location, onClose }) {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1); // 1: email, 2: child info, 3: waivers, 4: upsells
  const [parentEmail, setParentEmail] = useState('');
  const [children, setChildren] = useState([{
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    relationship: 'parent'
  }]);
  const [waivers, setWaivers] = useState({
    media_release: false,
    medical_waiver: false
  });
  const [upsells, setUpsells] = useState({});
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const spotsLeft = event.capacity - event.enrolled_count;
  const isFull = spotsLeft <= 0;
  const lowSpots = spotsLeft > 0 && spotsLeft <= 5;

  const addChild = () => {
    setChildren([...children, {
      first_name: '',
      last_name: '',
      dob: '',
      gender: '',
      relationship: 'parent'
    }]);
  };

  const removeChild = (index) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const updateUpsell = (childIndex, upsellType, value) => {
    setUpsells({
      ...upsells,
      [`${childIndex}_${upsellType}`]: value
    });
  };

  const calculateTotal = () => {
    let total = event.price * children.length;
    
    // Add upsells
    Object.entries(upsells).forEach(([key, value]) => {
      if (value) {
        const upsellType = key.split('_').slice(1).join('_');
        if (upsellType === 'private_lessons') {
          total += UPSELL_PRICES[upsellType] * value;
        } else {
          total += UPSELL_PRICES[upsellType];
        }
      }
    });

    return total;
  };

  const handleContinue = () => {
    if (step === 1 && parentEmail) {
      setStep(2);
    } else if (step === 2 && children.every(c => c.first_name && c.last_name && c.dob)) {
      setStep(3);
    } else if (step === 3 && waivers.media_release && waivers.medical_waiver) {
      setStep(4);
    }
  };

  const handleAddToCart = () => {
    // Calculate selected upsells for the item
    const selectedUpsells = Object.entries(upsells)
      .filter(([key, value]) => value)
      .map(([key]) => key.split('_').slice(1).join('_'));

    // Add each child as a separate cart item
    children.forEach((child, index) => {
      const childUpsells = selectedUpsells.filter(u => 
        Object.keys(upsells).some(k => k.startsWith(`${index}_`) && upsells[k])
      );

      addToCart({
        type: 'camp',
        name: event.title,
        description: `${child.first_name} ${child.last_name}`,
        price: event.price,
        quantity: 1,
        campEventId: event.id,
        locationId: event.location_id,
        studentName: `${child.first_name} ${child.last_name}`,
        studentDob: child.dob,
        parentEmail,
        image: event.thumbnail,
        upsells: childUpsells,
        locationTax: location?.tax_rate ? {
          percentage: location.tax_rate,
          displayName: location.tax_display_name || 'Tax',
        } : null,
      });
    });

    onClose();
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Event Details */}
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            </DialogHeader>

            {/* Image */}
            {event.thumbnail && (
              <img 
                src={event.thumbnail} 
                alt={event.title}
                className="w-full h-48 object-cover rounded-xl mt-4"
              />
            )}

            {/* Price & Spots */}
            <div className="flex items-center justify-between mt-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  ${(event.price / 100).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">per week</div>
              </div>
              {lowSpots && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">{spotsLeft} spots left</span>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="space-y-3 mt-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>
                  {format(new Date(event.start_datetime), 'MMM d')} - {format(new Date(event.end_datetime), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>
                  {event.daily_schedule?.drop_off || '9:00 AM'} - {event.daily_schedule?.pickup || '3:00 PM'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Ages {event.age_min}-{event.age_max}</span>
              </div>
            </div>

            {/* Description */}
            <Collapsible 
              open={descriptionExpanded} 
              onOpenChange={setDescriptionExpanded}
              className="mt-6"
            >
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                Course Description
                <ChevronDown className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-slate-600">
                {event.description || event.short_description}
              </CollapsibleContent>
            </Collapsible>

            {/* What You'll Learn */}
            {event.what_you_will_learn?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-2">In This Camp You Will:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {event.what_you_will_learn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tuition Includes */}
            {event.tuition_includes?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-2">Your Tuition Includes:</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  {event.tuition_includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Side - Registration Form */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              Register Now
            </h3>

            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Parent/Guardian Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleContinue}
                  disabled={!parentEmail}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Child Info */}
            {step === 2 && (
              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 relative">
                    {children.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeChild(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <h4 className="font-semibold mb-4">Child {index + 1}</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={child.first_name}
                            onChange={(e) => updateChild(index, 'first_name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={child.last_name}
                            onChange={(e) => updateChild(index, 'last_name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={child.dob}
                          onChange={(e) => updateChild(index, 'dob', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Select 
                          value={child.gender} 
                          onValueChange={(val) => updateChild(index, 'gender', val)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boy">Boy</SelectItem>
                            <SelectItem value="girl">Girl</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Select 
                          value={child.relationship} 
                          onValueChange={(val) => updateChild(index, 'relationship', val)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addChild}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Child
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleContinue} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Waivers */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="media"
                      checked={waivers.media_release}
                      onCheckedChange={(checked) => setWaivers({ ...waivers, media_release: checked })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="media" className="font-semibold cursor-pointer">
                        Media Release
                      </Label>
                      <p className="text-xs text-slate-600 mt-1">
                        I agree to allow Skill Samurai to use photos/videos for promotional purposes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="medical"
                      checked={waivers.medical_waiver}
                      onCheckedChange={(checked) => setWaivers({ ...waivers, medical_waiver: checked })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="medical" className="font-semibold cursor-pointer">
                        Medical Waiver
                      </Label>
                      <p className="text-xs text-slate-600 mt-1">
                        I understand emergency procedures and grant permission for medical treatment if needed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    disabled={!waivers.media_release || !waivers.medical_waiver}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Upsells */}
            {step === 4 && (
              <div className="space-y-6">
                <h4 className="font-semibold">Enhance Your Experience</h4>
                {children.map((child, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="font-semibold mb-3">
                      {child.first_name} {child.last_name}
                    </div>
                    <div className="space-y-3">
                      {event.upsells?.early_dropoff && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Early Drop-Off</div>
                            <div className="text-xs text-slate-600">8:00 AM start</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">${(UPSELL_PRICES.early_dropoff / 100).toFixed(0)}</span>
                            <Switch
                              checked={upsells[`${index}_early_dropoff`]}
                              onCheckedChange={(checked) => updateUpsell(index, 'early_dropoff', checked)}
                            />
                          </div>
                        </div>
                      )}
                      {event.upsells?.late_pickup && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Late Pickup</div>
                            <div className="text-xs text-slate-600">Until 5:00 PM</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">${(UPSELL_PRICES.late_pickup / 100).toFixed(0)}</span>
                            <Switch
                              checked={upsells[`${index}_late_pickup`]}
                              onCheckedChange={(checked) => updateUpsell(index, 'late_pickup', checked)}
                            />
                          </div>
                        </div>
                      )}
                      {event.upsells?.lunch_program && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Lunch Program</div>
                            <div className="text-xs text-slate-600">Daily lunch included</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">${(UPSELL_PRICES.lunch_program / 100).toFixed(0)}</span>
                            <Switch
                              checked={upsells[`${index}_lunch_program`]}
                              onCheckedChange={(checked) => updateUpsell(index, 'lunch_program', checked)}
                            />
                          </div>
                        </div>
                      )}
                      {event.upsells?.tshirt && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">Camp T-Shirt</div>
                            <div className="text-xs text-slate-600">Official camp merch</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">${(UPSELL_PRICES.tshirt / 100).toFixed(0)}</span>
                            <Switch
                              checked={upsells[`${index}_tshirt`]}
                              onCheckedChange={(checked) => updateUpsell(index, 'tshirt', checked)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">${(calculateTotal() / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}