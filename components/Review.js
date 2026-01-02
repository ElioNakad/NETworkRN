import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Reviews({ route }) {
  const { contact, defaultDescriptions } = route.params;

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // =============================
  // 🔹 FETCH REVIEWS (NEW ENDPOINT)
  // =============================
  const loadReviews = async (label) => {
    try {
      setSelectedLabel(label);
      setLoadingReviews(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://192.168.16.106:3000/api/review/my-reviews?labelId=${label.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setReviews(data.reviews);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  // =============================
  // 🔹 SUBMIT REVIEW (UNCHANGED)
  // =============================
  const submitReview = async () => {
    if (!review.trim()) {
      Alert.alert("Error", "Review cannot be empty");
      return;
    }

    try {
      setLoadingSubmit(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        "http://192.168.16.106:3000/api/review/insert-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            default_description_id: selectedLabel.id,
            review,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Review submitted ⭐");
      setModalVisible(false);
      setReview("");

      // 🔁 Reload reviews instantly
      loadReviews(selectedLabel);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <Text style={styles.contactName}>{contact.display_name}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ================= LABELS SECTION ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Category</Text>
          {defaultDescriptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.labelCard,
                selectedLabel?.id === item.id && styles.activeLabel,
              ]}
              onPress={() => loadReviews(item)}
              activeOpacity={0.7}
            >
              <View style={styles.labelHeader}>
                <Text style={[
                  styles.label,
                  selectedLabel?.id === item.id && styles.activeLabelText
                ]}>
                  {item.label}
                </Text>
                {selectedLabel?.id === item.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= REVIEWS SECTION ================= */}
        {selectedLabel && (
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.categoryBadge}>{selectedLabel.label}</Text>
            </View>

            {loadingReviews && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f5b400" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            )}

            {!loadingReviews && reviews.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubtext}>Be the first to add a review!</Text>
              </View>
            )}

            {!loadingReviews && reviews.map((r, index) => (
              <View key={r.review_id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {r.reviewer_fname?.[0]}{r.reviewer_lname?.[0]}
                    </Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewer}>
                      {r.reviewer_fname} {r.reviewer_lname}
                    </Text>
                    <Text style={styles.reviewNumber}>Review #{reviews.length - index}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.review_text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ================= ADD REVIEW BUTTON ================= */}
      {selectedLabel && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>✍️</Text>
        </TouchableOpacity>
      )}

      {/* ================= MODAL ================= */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalCategoryTag}>
              <Text style={styles.modalCategoryText}>{selectedLabel?.label}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Share your thoughts..."
              placeholderTextColor="#999"
              multiline
              value={review}
              onChangeText={setReview}
              maxLength={500}
            />

            <Text style={styles.charCount}>{review.length}/500</Text>

            <TouchableOpacity
              style={[styles.submitButton, loadingSubmit && styles.submitButtonDisabled]}
              onPress={submitReview}
              disabled={loadingSubmit}
              activeOpacity={0.8}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  labelCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e8ecf1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLabel: {
    borderColor: "#f5b400",
    backgroundColor: "#fffbf0",
    shadowColor: "#f5b400",
    shadowOpacity: 0.15,
    elevation: 4,
  },
  labelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a1a",
  },
  activeLabelText: {
    color: "#f5b400",
  },
  description: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  selectedBadge: {
    backgroundColor: "#f5b400",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#f5b400",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8ecf1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5b400",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewer: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  reviewNumber: {
    fontSize: 12,
    color: "#999",
  },
  reviewText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#f5b400",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f5b400",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalCategoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#fffbf0",
    borderWidth: 1,
    borderColor: "#f5b400",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalCategoryText: {
    color: "#f5b400",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e8ecf1",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    textAlignVertical: "top",
    fontSize: 15,
    lineHeight: 22,
    color: "#1a1a1a",
    backgroundColor: "#fafbfc",
  },
  charCount: {
    textAlign: "right",
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  submitButton: {
    backgroundColor: "#f5b400",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#f5b400",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
  },
});